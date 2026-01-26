/**
 * API Envelope DTOs
 * Base DTO types wrapping the unified API envelope structure
 * v0.41.7 - C3 Step 8: DTO Consolidation Foundation
 */
import type { ApiSuccessResponse, ApiErrorResponse, ApiMeta } from '@parel/api';
/**
 * Success response envelope DTO
 * Wraps the unified API success response structure
 */
export type ApiEnvelopeDTO<T = any> = ApiSuccessResponse<T>;
/**
 * Error response envelope DTO
 * Wraps the unified API error response structure
 */
export type ApiErrorDTO = ApiErrorResponse;
/**
 * Meta information DTO
 * Request metadata (timestamp, requestId, version)
 */
export type ApiMetaDTO = ApiMeta;
