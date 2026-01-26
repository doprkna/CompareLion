/**
 * @parel/api - Unified API Package
 *
 * Provides:
 * - Unified API response envelope (v0.41.0+)
 * - Unified API client (v0.41.11+)
 *
 * Usage:
 * ```typescript
 * import { defaultClient, buildSuccess, buildError } from '@parel/api';
 *
 * // Client usage
 * const response = await defaultClient.get<DataType>('/endpoint');
 * const data = response.data;
 *
 * // Server-side helpers
 * return buildSuccess(req, data);
 * ```
 *
 * v0.41.0 - C3 Step 1: API Envelope Standardization
 * v0.41.11 - C3 Step 12: API Client Consolidation (Foundation Layer)
 * v0.41.15 - C3 Step 16: API Client Cleanup & Deprecation Pass
 */
export * from './envelope';
export * from './client';
