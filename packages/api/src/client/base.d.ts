/**
 * API Client Base
 * Main API client class with type-safe HTTP methods
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
import type { ApiClientConfig, RequestOptions, ApiClientResponse } from './types';
/**
 * Unified API Client
 * Provides type-safe HTTP methods with automatic envelope parsing
 */
export declare class ApiClient {
    private config;
    constructor(config?: Partial<ApiClientConfig>);
    /**
     * Build full URL from path
     */
    private buildURL;
    /**
     * Merge request options with client config
     */
    private mergeOptions;
    /**
     * Execute HTTP request
     */
    private request;
    /**
     * GET request
     */
    get<T = any>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiClientResponse<T>>;
    /**
     * POST request
     */
    post<T = any>(path: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiClientResponse<T>>;
    /**
     * PUT request
     */
    put<T = any>(path: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiClientResponse<T>>;
    /**
     * PATCH request
     */
    patch<T = any>(path: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiClientResponse<T>>;
    /**
     * DELETE request
     */
    delete<T = any>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiClientResponse<T>>;
}
/**
 * Create API client instance
 */
export declare function createApiClient(config?: Partial<ApiClientConfig>): ApiClient;
/**
 * Default API client instance
 */
export declare const defaultClient: ApiClient;
