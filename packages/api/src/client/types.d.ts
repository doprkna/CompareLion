/**
 * API Client Types
 * Type definitions for the unified API client
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
/**
 * Retry configuration
 */
export interface RetryOptions {
    /** Maximum number of retry attempts */
    maxRetries: number;
    /** Initial retry delay in milliseconds */
    initialDelay: number;
    /** Maximum retry delay in milliseconds */
    maxDelay: number;
    /** Whether to use exponential backoff */
    exponentialBackoff: boolean;
    /** HTTP status codes that should trigger retry */
    retryableStatusCodes: number[];
}
/**
 * API Client configuration
 */
export interface ApiClientConfig {
    /** Base URL for API requests (default: '/api') */
    baseURL?: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Retry configuration */
    retry?: Partial<RetryOptions>;
    /** Default headers to include in all requests */
    headers?: Record<string, string>;
    /** Whether to include credentials (cookies) in requests */
    credentials?: RequestCredentials;
}
/**
 * Per-request options
 */
export interface RequestOptions extends RequestInit {
    /** Override timeout for this request */
    timeout?: number;
    /** Override retry config for this request */
    retry?: Partial<RetryOptions>;
    /** Skip retry logic for this request */
    skipRetry?: boolean;
    /** Additional headers for this request */
    headers?: Record<string, string>;
}
/**
 * API Client response wrapper
 * Contains the parsed data from envelope or error information
 */
export interface ApiClientResponse<T = any> {
    /** Response data (from envelope.data) */
    data: T;
    /** Response metadata (from envelope.meta) */
    meta?: {
        timestamp: string;
        requestId: string;
        version: string;
    };
    /** Pagination info (if present) */
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        hasMore: boolean;
    };
    /** Raw response object */
    response: Response;
}
