/**
 * API Envelope Standardization (C3 Step 1-2)
 * Unified response structure for all API endpoints
 * v0.41.0 - Foundation
 * v0.41.1 - Next.js helpers + pilot adoption
 */
import { NextRequest, NextResponse } from 'next/server';
export declare enum ApiErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
}
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
export interface ApiErrorDetails {
    [field: string]: string[];
}
export interface ApiError {
    code: ApiErrorCode | string;
    message: string;
    details?: ApiErrorDetails;
    requestId: string;
    timestamp: string;
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
/**
 * Create a success response envelope
 */
export declare function createSuccessResponse<T>(data: T | null, options: {
    requestId: string;
    version?: string;
    pagination?: ApiPagination;
}): ApiSuccessResponse<T>;
/**
 * Create an error response envelope
 */
export declare function createErrorResponse(code: ApiErrorCode | string, message: string, options: {
    requestId: string;
    details?: ApiErrorDetails;
    version?: string;
}): ApiErrorResponse;
/**
 * Create pagination metadata from offset-based pagination
 */
export declare function createPagination(page: number, pageSize: number, total: number): ApiPagination;
/**
 * Parse pagination parameters from query string
 * Defaults: page=1, pageSize=20, maxPageSize=100
 */
export declare function parsePaginationParams(searchParams: URLSearchParams, options?: {
    defaultPageSize?: number;
    maxPageSize?: number;
}): {
    page: number;
    pageSize: number;
};
/**
 * Build meta object from NextRequest
 * Extracts requestId from request headers or generates a new one
 */
export declare function buildMeta(req: NextRequest, version?: string): ApiMeta;
/**
 * Build a success NextResponse with envelope
 * Automatically extracts requestId from NextRequest
 */
export declare function buildSuccess<T>(req: NextRequest, data: T | null, options?: {
    version?: string;
    pagination?: ApiPagination;
    status?: number;
}): NextResponse;
/**
 * Build an error NextResponse with envelope
 * Automatically extracts requestId from NextRequest
 */
export declare function buildError(req: NextRequest, code: ApiErrorCode | string, message: string, options?: {
    details?: ApiErrorDetails;
    status?: number;
    version?: string;
}): NextResponse;
