/**
 * Unified API Error Handler
 * Consistent error responses and logging across all API routes
 */
import { NextResponse } from 'next/server';
export interface ApiError {
    success: false;
    error: string;
    code?: string;
    details?: any;
    timestamp: string;
}
export interface ApiSuccess<T = any> {
    success: true;
    data?: T;
    message?: string;
    timestamp: string;
}
/**
 * Create error response
 */
export declare function errorResponse(message: string, status?: number, code?: string, details?: any): NextResponse<ApiError>;
/**
 * Create success response
 */
export declare function successResponse<T = any>(data?: T, message?: string, status?: number): NextResponse<ApiSuccess<T>>;
/**
 * Handle different error types uniformly
 */
export declare function handleApiError(err: unknown, context?: string): NextResponse<ApiError>;
/**
 * Async handler wrapper to catch errors
 */
export declare function asyncHandler<T = any>(handler: (req: Request, context?: any) => Promise<NextResponse<T>>): (req: Request, context?: any) => Promise<NextResponse<T | ApiError>>;
/**
 * Rate limit error
 */
export declare function rateLimitError(retryAfter?: number): NextResponse<ApiError>;
/**
 * Authentication error
 */
export declare function authError(message?: string): NextResponse<ApiError>;
/**
 * Authorization error
 */
export declare function forbiddenError(message?: string): NextResponse<ApiError>;
/**
 * Not found error
 */
export declare function notFoundError(resource?: string): NextResponse<ApiError>;
/**
 * Validation error
 */
export declare function validationError(message: string, details?: any): NextResponse<ApiError>;
/**
 * Server error
 */
export declare function serverError(message?: string): NextResponse<ApiError>;
/**
 * Simple alias exports for cleaner imports
 * v0.30.4 - Infrastructure Refactor
 */
export declare const apiSuccess: typeof successResponse;
export declare const apiError: typeof errorResponse;
