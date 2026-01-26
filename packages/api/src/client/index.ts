/**
 * API Client Module
 * Unified API client for frontend applications
 * 
 * **Recommended Usage:**
 * ```typescript
 * import { defaultClient } from '@parel/api/client';
 * 
 * // GET request
 * const response = await defaultClient.get<DataType>('/endpoint');
 * const data = response.data;
 * 
 * // POST request
 * const response = await defaultClient.post<DataType>('/endpoint', bodyData);
 * const result = response.data;
 * ```
 * 
 * **Custom Client:**
 * ```typescript
 * import { createApiClient } from '@parel/api/client';
 * 
 * const customClient = createApiClient({
 *   baseURL: '/api/v2',
 *   timeout: 60000,
 * });
 * ```
 * 
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 * v0.41.15 - C3 Step 16: API Client Cleanup & Deprecation Pass
 */

// Base client (defaultClient is the recommended entry point)
export { ApiClient, createApiClient, defaultClient } from './base';

// Configuration
export { getDefaultConfig, createClientConfig } from './config';

// Errors
export {
  ApiClientError,
  ApiTimeoutError,
  ApiNetworkError,
  normalizeError,
  createErrorFromEnvelope,
} from './errors';

// HTTP utilities
export { createFetchWrapper, parseEnvelopeResponse } from './http';

// Types
export type {
  ApiClientConfig,
  RequestOptions,
  RetryOptions,
  ApiClientResponse,
} from './types';

