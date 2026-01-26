/**
 * API Envelope Standardization (C3 Step 1-2)
 * Unified response structure for all API endpoints
 * v0.41.0 - Foundation
 * v0.41.1 - Next.js helpers + pilot adoption
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRequestId, addRequestIdToResponse } from '@parel/core/utils/requestId';

// ========== ERROR CODES ==========

export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// ========== TYPES ==========

export interface ApiMeta {
  timestamp: string; // ISO 8601
  requestId: string; // UUID
  version: string; // API version
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface ApiErrorDetails {
  [field: string]: string[]; // Field-level validation errors
}

export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
  details?: ApiErrorDetails;
  requestId: string;
  timestamp: string; // ISO 8601
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T | null;
  meta: ApiMeta;
  pagination?: ApiPagination;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ========== HELPER FUNCTIONS ==========

/**
 * Create a success response envelope
 */
export function createSuccessResponse<T>(
  data: T | null,
  options: {
    requestId: string;
    version?: string;
    pagination?: ApiPagination;
  }
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: options.requestId,
      version: options.version || 'v0.41.0',
    },
    ...(options.pagination && { pagination: options.pagination }),
  };
}

/**
 * Create an error response envelope
 */
export function createErrorResponse(
  code: ApiErrorCode | string,
  message: string,
  options: {
    requestId: string;
    details?: ApiErrorDetails;
    version?: string;
  }
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(options.details && { details: options.details }),
      requestId: options.requestId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create pagination metadata from offset-based pagination
 */
export function createPagination(
  page: number,
  pageSize: number,
  total: number
): ApiPagination {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    hasMore: page < totalPages,
  };
}

/**
 * Parse pagination parameters from query string
 * Defaults: page=1, pageSize=20, maxPageSize=100
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  options: {
    defaultPageSize?: number;
    maxPageSize?: number;
  } = {}
): { page: number; pageSize: number } {
  const { defaultPageSize = 20, maxPageSize = 100 } = options;

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.min(
    Math.max(1, parseInt(searchParams.get('pageSize') || defaultPageSize.toString(), 10) || defaultPageSize),
    maxPageSize
  );

  return { page, pageSize };
}

// ========== NEXT.JS SPECIFIC HELPERS ==========

/**
 * Build meta object from NextRequest
 * Extracts requestId from request headers or generates a new one
 */
export function buildMeta(req: NextRequest, version?: string): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    requestId: getRequestId(req),
    version: version || 'v0.41.1',
  };
}

/**
 * Build a success NextResponse with envelope
 * Automatically extracts requestId from NextRequest
 */
export function buildSuccess<T>(
  req: NextRequest,
  data: T | null,
  options?: {
    version?: string;
    pagination?: ApiPagination;
    status?: number;
  }
): NextResponse {
  const meta = buildMeta(req, options?.version);
  const envelope: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta,
    ...(options?.pagination && { pagination: options.pagination }),
  };

  const response = NextResponse.json(envelope, { status: options?.status || 200 });
  return addRequestIdToResponse(response, meta.requestId);
}

/**
 * Build an error NextResponse with envelope
 * Automatically extracts requestId from NextRequest
 */
export function buildError(
  req: NextRequest,
  code: ApiErrorCode | string,
  message: string,
  options?: {
    details?: ApiErrorDetails;
    status?: number;
    version?: string;
  }
): NextResponse {
  const requestId = getRequestId(req);
  const meta = buildMeta(req, options?.version);
  
  const envelope: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(options?.details && { details: options.details }),
      requestId,
      timestamp: meta.timestamp,
    },
  };

  // Map error codes to HTTP status codes
  const statusCode = options?.status || getStatusCodeForError(code);
  const response = NextResponse.json(envelope, { status: statusCode });
  return addRequestIdToResponse(response, requestId);
}

/**
 * Map error codes to HTTP status codes
 */
function getStatusCodeForError(code: ApiErrorCode | string): number {
  switch (code) {
    case ApiErrorCode.VALIDATION_ERROR:
      return 400;
    case ApiErrorCode.AUTHENTICATION_ERROR:
      return 401;
    case ApiErrorCode.AUTHORIZATION_ERROR:
      return 403;
    case ApiErrorCode.NOT_FOUND:
      return 404;
    case ApiErrorCode.CONFLICT:
      return 409;
    case ApiErrorCode.RATE_LIMIT_ERROR:
      return 429;
    case ApiErrorCode.SERVICE_UNAVAILABLE:
      return 503;
    case ApiErrorCode.INTERNAL_ERROR:
    default:
      return 500;
  }
}

