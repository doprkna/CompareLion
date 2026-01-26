/**
 * API Client Errors
 * Error classes and normalization for API client
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */

import type { ApiErrorCode, ApiErrorDetails } from '../envelope';

/**
 * Base API client error
 */
export class ApiClientError extends Error {
  /** Error code from API envelope */
  code: ApiErrorCode | string;
  /** HTTP status code */
  status: number;
  /** Request ID from envelope */
  requestId?: string;
  /** Validation error details (if any) */
  details?: ApiErrorDetails;
  /** Original error (if any) */
  originalError?: Error;

  constructor(
    message: string,
    code: ApiErrorCode | string,
    status: number,
    options?: {
      requestId?: string;
      details?: ApiErrorDetails;
      originalError?: Error;
    }
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.requestId = options?.requestId;
    this.details = options?.details;
    this.originalError = options?.originalError;
  }
}

/**
 * Timeout error
 */
export class ApiTimeoutError extends ApiClientError {
  constructor(timeout: number, requestId?: string) {
    super(
      `Request timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      408,
      { requestId }
    );
    this.name = 'ApiTimeoutError';
  }
}

/**
 * Network error
 */
export class ApiNetworkError extends ApiClientError {
  constructor(message: string, originalError?: Error) {
    super(
      message || 'Network error occurred',
      'NETWORK_ERROR',
      0,
      { originalError }
    );
    this.name = 'ApiNetworkError';
  }
}

/**
 * Normalize error from various sources to ApiClientError
 */
export function normalizeError(
  error: unknown,
  status?: number,
  requestId?: string
): ApiClientError {
  // Already an ApiClientError
  if (error instanceof ApiClientError) {
    return error;
  }

  // Native Error
  if (error instanceof Error) {
    // Network/fetch errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new ApiNetworkError(error.message, error);
    }
    
    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new ApiTimeoutError(30000, requestId);
    }

    // Generic error
    return new ApiClientError(
      error.message,
      'INTERNAL_ERROR',
      status || 500,
      { originalError: error, requestId }
    );
  }

  // Unknown error type
  return new ApiClientError(
    'An unknown error occurred',
    'INTERNAL_ERROR',
    status || 500,
    { requestId }
  );
}

/**
 * Create ApiClientError from API error response envelope
 */
export function createErrorFromEnvelope(
  errorResponse: {
    error: {
      code: ApiErrorCode | string;
      message: string;
      details?: ApiErrorDetails;
      requestId: string;
    };
  },
  status: number
): ApiClientError {
  return new ApiClientError(
    errorResponse.error.message,
    errorResponse.error.code,
    status,
    {
      requestId: errorResponse.error.requestId,
      details: errorResponse.error.details,
    }
  );
}

