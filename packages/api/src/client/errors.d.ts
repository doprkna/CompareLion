/**
 * API Client Errors
 * Error classes and normalization for API client
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
import type { ApiErrorCode, ApiErrorDetails } from '../envelope';
/**
 * Base API client error
 */
export declare class ApiClientError extends Error {
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
    constructor(message: string, code: ApiErrorCode | string, status: number, options?: {
        requestId?: string;
        details?: ApiErrorDetails;
        originalError?: Error;
    });
}
/**
 * Timeout error
 */
export declare class ApiTimeoutError extends ApiClientError {
    constructor(timeout: number, requestId?: string);
}
/**
 * Network error
 */
export declare class ApiNetworkError extends ApiClientError {
    constructor(message: string, originalError?: Error);
}
/**
 * Normalize error from various sources to ApiClientError
 */
export declare function normalizeError(error: unknown, status?: number, requestId?: string): ApiClientError;
/**
 * Create ApiClientError from API error response envelope
 */
export declare function createErrorFromEnvelope(errorResponse: {
    error: {
        code: ApiErrorCode | string;
        message: string;
        details?: ApiErrorDetails;
        requestId: string;
    };
}, status: number): ApiClientError;
