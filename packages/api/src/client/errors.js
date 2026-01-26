/**
 * API Client Errors
 * Error classes and normalization for API client
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
/**
 * Base API client error
 */
export class ApiClientError extends Error {
    constructor(message, code, status, options) {
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
    constructor(timeout, requestId) {
        super(`Request timed out after ${timeout}ms`, 'TIMEOUT_ERROR', 408, { requestId });
        this.name = 'ApiTimeoutError';
    }
}
/**
 * Network error
 */
export class ApiNetworkError extends ApiClientError {
    constructor(message, originalError) {
        super(message || 'Network error occurred', 'NETWORK_ERROR', 0, { originalError });
        this.name = 'ApiNetworkError';
    }
}
/**
 * Normalize error from various sources to ApiClientError
 */
export function normalizeError(error, status, requestId) {
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
        return new ApiClientError(error.message, 'INTERNAL_ERROR', status || 500, { originalError: error, requestId });
    }
    // Unknown error type
    return new ApiClientError('An unknown error occurred', 'INTERNAL_ERROR', status || 500, { requestId });
}
/**
 * Create ApiClientError from API error response envelope
 */
export function createErrorFromEnvelope(errorResponse, status) {
    return new ApiClientError(errorResponse.error.message, errorResponse.error.code, status, {
        requestId: errorResponse.error.requestId,
        details: errorResponse.error.details,
    });
}
