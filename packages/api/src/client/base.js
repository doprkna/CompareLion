/**
 * API Client Base
 * Main API client class with type-safe HTTP methods
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */
import { createClientConfig, getDefaultConfig } from './config';
import { createFetchWrapper, parseEnvelopeResponse } from './http';
import { normalizeError } from './errors';
/**
 * Unified API Client
 * Provides type-safe HTTP methods with automatic envelope parsing
 */
export class ApiClient {
    constructor(config) {
        this.config = createClientConfig(config);
    }
    /**
     * Build full URL from path
     */
    buildURL(path) {
        // If path is absolute URL, use as-is
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        // Ensure baseURL ends with / and path doesn't start with /
        const baseURL = this.config.baseURL.endsWith('/')
            ? this.config.baseURL.slice(0, -1)
            : this.config.baseURL;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseURL}${cleanPath}`;
    }
    /**
     * Merge request options with client config
     */
    mergeOptions(options) {
        const mergedHeaders = {
            ...this.config.headers,
            ...options?.headers,
        };
        const defaultRetry = getDefaultConfig().retry;
        const mergedRetry = {
            maxRetries: options?.retry?.maxRetries ?? (this.config.retry.maxRetries ?? defaultRetry.maxRetries),
            initialDelay: options?.retry?.initialDelay ?? (this.config.retry.initialDelay ?? defaultRetry.initialDelay),
            maxDelay: options?.retry?.maxDelay ?? (this.config.retry.maxDelay ?? defaultRetry.maxDelay),
            exponentialBackoff: options?.retry?.exponentialBackoff ?? (this.config.retry.exponentialBackoff ?? defaultRetry.exponentialBackoff),
            retryableStatusCodes: options?.retry?.retryableStatusCodes ?? (this.config.retry.retryableStatusCodes ?? defaultRetry.retryableStatusCodes),
        };
        return {
            ...options,
            headers: mergedHeaders,
            timeout: options?.timeout ?? this.config.timeout,
            retry: mergedRetry,
            credentials: options?.credentials ?? this.config.credentials,
        };
    }
    /**
     * Execute HTTP request
     */
    async request(path, options) {
        const url = this.buildURL(path);
        const mergedOptions = this.mergeOptions(options);
        try {
            const response = await createFetchWrapper(url, mergedOptions);
            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                // For non-JSON, return raw response
                return {
                    data: null,
                    response,
                };
            }
            const json = await response.json();
            return parseEnvelopeResponse(response, json);
        }
        catch (error) {
            throw normalizeError(error, undefined, undefined);
        }
    }
    /**
     * GET request
     */
    async get(path, options) {
        return this.request(path, { ...options, method: 'GET' });
    }
    /**
     * POST request
     */
    async post(path, body, options) {
        return this.request(path, {
            ...options,
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    /**
     * PUT request
     */
    async put(path, body, options) {
        return this.request(path, {
            ...options,
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    /**
     * PATCH request
     */
    async patch(path, body, options) {
        return this.request(path, {
            ...options,
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    /**
     * DELETE request
     */
    async delete(path, options) {
        return this.request(path, { ...options, method: 'DELETE' });
    }
}
/**
 * Create API client instance
 */
export function createApiClient(config) {
    return new ApiClient(config);
}
/**
 * Default API client instance
 */
export const defaultClient = new ApiClient();
