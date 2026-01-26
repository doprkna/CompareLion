/**
 * HTTP Client Utilities
 * Fetch wrapper with retry, timeout, and envelope parsing
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
import type { ApiResponse } from '../envelope';
import type { RequestOptions, RetryOptions, ApiClientResponse } from './types';
/**
 * Parse envelope response
 * Extracts data from success response or throws error
 */
export declare function parseEnvelopeResponse<T = any>(response: Response, json: ApiResponse<T>): ApiClientResponse<T>;
/**
 * Create fetch wrapper with retry and timeout
 */
export declare function createFetchWrapper(url: string, options: RequestOptions & {
    timeout: number;
    retry: RetryOptions;
}): Promise<Response>;
