/**
 * HTTP Client Utilities
 * Fetch wrapper with retry, timeout, and envelope parsing
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */

import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from '../envelope';
import type { RequestOptions, RetryOptions, ApiClientResponse } from './types';
import {
  ApiClientError,
  ApiTimeoutError,
  ApiNetworkError,
  normalizeError,
  createErrorFromEnvelope,
} from './errors';

/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  exponentialBackoff: boolean
): number {
  if (!exponentialBackoff) {
    return initialDelay;
  }
  
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Check if status code is retryable
 */
function isRetryableStatus(
  status: number,
  retryableStatusCodes: number[]
): boolean {
  return retryableStatusCodes.includes(status);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parse envelope response
 * Extracts data from success response or throws error
 */
export function parseEnvelopeResponse<T = any>(
  response: Response,
  json: ApiResponse<T>
): ApiClientResponse<T> {
  if (json.success === false) {
    throw createErrorFromEnvelope(json, response.status);
  }

  const successResponse = json as ApiSuccessResponse<T>;
  
  return {
    data: successResponse.data as T,
    meta: successResponse.meta,
    pagination: successResponse.pagination,
    response,
  };
}

/**
 * Create fetch wrapper with retry and timeout
 */
export async function createFetchWrapper(
  url: string,
  options: RequestOptions & {
    timeout: number;
    retry: RetryOptions;
  }
): Promise<Response> {
  const { timeout, retry, skipRetry, ...fetchOptions } = options;
  
  let lastError: Error | null = null;
  const maxAttempts = skipRetry ? 1 : retry.maxRetries + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if status is retryable
        if (
          !response.ok &&
          attempt < maxAttempts - 1 &&
          isRetryableStatus(response.status, retry.retryableStatusCodes)
        ) {
          // Calculate delay before retry
          const delay = calculateRetryDelay(
            attempt,
            retry.initialDelay,
            retry.maxDelay,
            retry.exponentialBackoff
          );
          
          await sleep(delay);
          continue;
        }

        return response;
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId);
        
        // Handle abort (timeout)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new ApiTimeoutError(timeout);
        }
        
        throw fetchError;
      }
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on non-retryable errors
      if (
        error instanceof ApiTimeoutError ||
        error instanceof ApiNetworkError ||
        (error instanceof ApiClientError && !isRetryableStatus(error.status, retry.retryableStatusCodes))
      ) {
        throw error;
      }

      // Last attempt, throw error
      if (attempt === maxAttempts - 1) {
        throw normalizeError(error);
      }

      // Calculate delay before retry
      const delay = calculateRetryDelay(
        attempt,
        retry.initialDelay,
        retry.maxDelay,
        retry.exponentialBackoff
      );
      
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw normalizeError(lastError);
}

