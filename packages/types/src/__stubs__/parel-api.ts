/**
 * Build-time stub for @parel/api so packages/types compiles without
 * pulling in packages/api source (avoids TS6059/TS6307).
 */

export interface ApiMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T | null;
  meta: ApiMeta;
  pagination?: ApiPagination;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}
