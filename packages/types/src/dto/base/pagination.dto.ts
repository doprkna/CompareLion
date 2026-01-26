/**
 * Pagination DTOs
 * Pagination-related data transfer objects
 * v0.41.7 - C3 Step 8: DTO Consolidation Foundation
 */

import type { ApiPagination } from '@parel/api';

/**
 * Pagination metadata DTO
 * Wraps the unified API pagination structure
 */
export type PaginationDTO = ApiPagination;

/**
 * Pagination input parameters DTO
 * Used for requesting paginated data
 */
export interface PaginationParamsDTO {
  /** Page number (1-indexed) */
  page?: number;
  /** Number of items per page */
  pageSize?: number;
  /** Cursor for cursor-based pagination (optional) */
  cursor?: string;
}

