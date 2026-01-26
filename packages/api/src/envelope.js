/**
 * API Envelope Standardization (C3 Step 1-2)
 * Unified response structure for all API endpoints
 * v0.41.0 - Foundation
 * v0.41.1 - Next.js helpers + pilot adoption
 */
import { NextResponse } from 'next/server';
import { getRequestId, addRequestIdToResponse } from '@parel/core/utils/requestId';
// ========== ERROR CODES ==========
export var ApiErrorCode;
(function (ApiErrorCode) {
    ApiErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ApiErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    ApiErrorCode["AUTHORIZATION_ERROR"] = "AUTHORIZATION_ERROR";
    ApiErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ApiErrorCode["CONFLICT"] = "CONFLICT";
    ApiErrorCode["RATE_LIMIT_ERROR"] = "RATE_LIMIT_ERROR";
    ApiErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorCode["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
})(ApiErrorCode || (ApiErrorCode = {}));
// ========== HELPER FUNCTIONS ==========
/**
 * Create a success response envelope
 */
export function createSuccessResponse(data, options) {
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
export function createErrorResponse(code, message, options) {
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
export function createPagination(page, pageSize, total) {
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
export function parsePaginationParams(searchParams, options = {}) {
    const { defaultPageSize = 20, maxPageSize = 100 } = options;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(Math.max(1, parseInt(searchParams.get('pageSize') || defaultPageSize.toString(), 10) || defaultPageSize), maxPageSize);
    return { page, pageSize };
}
// ========== NEXT.JS SPECIFIC HELPERS ==========
/**
 * Build meta object from NextRequest
 * Extracts requestId from request headers or generates a new one
 */
export function buildMeta(req, version) {
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
export function buildSuccess(req, data, options) {
    const meta = buildMeta(req, options?.version);
    const envelope = {
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
export function buildError(req, code, message, options) {
    const requestId = getRequestId(req);
    const meta = buildMeta(req, options?.version);
    const envelope = {
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
function getStatusCodeForError(code) {
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
