/**
 * API Client Configuration
 * Default configuration and config factory
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 */

import type { ApiClientConfig, RetryOptions } from './types';

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryOptions = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  exponentialBackoff: true,
  retryableStatusCodes: [
    408, // Request Timeout
    429, // Too Many Requests
    500, // Internal Server Error
    502, // Bad Gateway
    503, // Service Unavailable
    504, // Gateway Timeout
  ],
};

/**
 * Default API client configuration
 */
export function getDefaultConfig(): Required<ApiClientConfig> {
  return {
    baseURL: '/api',
    timeout: 30000, // 30 seconds
    retry: DEFAULT_RETRY_CONFIG,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'same-origin',
  };
}

/**
 * Create API client configuration with overrides
 */
export function createClientConfig(
  overrides?: Partial<ApiClientConfig>
): Required<ApiClientConfig> {
  const defaultConfig = getDefaultConfig();
  
  return {
    baseURL: overrides?.baseURL ?? defaultConfig.baseURL,
    timeout: overrides?.timeout ?? defaultConfig.timeout,
    retry: {
      ...defaultConfig.retry,
      ...overrides?.retry,
    },
    headers: {
      ...defaultConfig.headers,
      ...overrides?.headers,
    },
    credentials: overrides?.credentials ?? defaultConfig.credentials,
  };
}

