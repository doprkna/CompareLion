/**
 * HTTP Client Utilities
 * Fetch wrapper with retry, timeout, and envelope parsing
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
import { ApiClientError, ApiTimeoutError, ApiNetworkError, normalizeError, createErrorFromEnvelope, } from './errors';
/**
 * Calculate retry delay with exponential backoff
 */
function calculateRetryDelay(attempt, initialDelay, maxDelay, exponentialBackoff) {
    if (!exponentialBackoff) {
        return initialDelay;
    }
    const delay = initialDelay * Math.pow(2, attempt);
    return Math.min(delay, maxDelay);
}
/**
 * Check if status code is retryable
 */
function isRetryableStatus(status, retryableStatusCodes) {
    return retryableStatusCodes.includes(status);
}
/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Parse envelope response
 * Extracts data from success response or throws error
 */
export function parseEnvelopeResponse(response, json) {
    if (json.success === false) {
        throw createErrorFromEnvelope(json, response.status);
    }
    const successResponse = json;
    return {
        data: successResponse.data,
        meta: successResponse.meta,
        pagination: successResponse.pagination,
        response,
    };
}
/**
 * Create fetch wrapper with retry and timeout
 */
export async function createFetchWrapper(url, options) {
    const { timeout, retry, skipRetry, ...fetchOptions } = options;
    let lastError = null;
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
                if (!response.ok &&
                    attempt < maxAttempts - 1 &&
                    isRetryableStatus(response.status, retry.retryableStatusCodes)) {
                    // Calculate delay before retry
                    const delay = calculateRetryDelay(attempt, retry.initialDelay, retry.maxDelay, retry.exponentialBackoff);
                    await sleep(delay);
                    continue;
                }
                return response;
            }
            catch (fetchError) {
                clearTimeout(timeoutId);
                // Handle abort (timeout)
                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    throw new ApiTimeoutError(timeout);
                }
                throw fetchError;
            }
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            // Don't retry on non-retryable errors
            if (error instanceof ApiTimeoutError ||
                error instanceof ApiNetworkError ||
                (error instanceof ApiClientError && !isRetryableStatus(error.status, retry.retryableStatusCodes))) {
                throw error;
            }
            // Last attempt, throw error
            if (attempt === maxAttempts - 1) {
                throw normalizeError(error);
            }
            // Calculate delay before retry
            const delay = calculateRetryDelay(attempt, retry.initialDelay, retry.maxDelay, retry.exponentialBackoff);
            await sleep(delay);
        }
    }
    // Should never reach here, but TypeScript needs it
    throw normalizeError(lastError);
}
