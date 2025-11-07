/**
 * Unified API Error Handler
 * Consistent error responses and logging across all API routes
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@parel/db/client';
import { error as logError } from '@/lib/utils/debug';

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
export function errorResponse(
  message: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiError> {
  const response: ApiError = {
    success: false,
    error: message,
    code,
    details,
    timestamp: new Date().toISOString(),
  };
  
  // Log error (except for expected 4xx errors)
  if (status >= 500) {
    logError(message, undefined, { status, code, details });
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Create success response
 */
export function successResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  const response: ApiSuccess<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Handle different error types uniformly
 */
export function handleApiError(err: unknown, context?: string): NextResponse<ApiError> {
  const prefix = context ? `${context}: ` : '';
  
  // Zod validation errors
  if (err instanceof ZodError) {
    return errorResponse(
      `${prefix}Invalid input data`,
      400,
      'VALIDATION_ERROR',
      err.errors.map(e => ({ path: e.path.join('.'), message: e.message }))
    );
  }
  
  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return errorResponse(
          `${prefix}A record with this information already exists`,
          409,
          'DUPLICATE_ERROR',
          { field: err.meta?.target }
        );
      case 'P2025':
        return errorResponse(
          `${prefix}Record not found`,
          404,
          'NOT_FOUND'
        );
      case 'P2003':
        return errorResponse(
          `${prefix}Referenced record not found`,
          400,
          'FOREIGN_KEY_ERROR'
        );
      default:
        return errorResponse(
          `${prefix}Database error`,
          500,
          'DATABASE_ERROR',
          { code: err.code }
        );
    }
  }
  
  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return errorResponse(
      `${prefix}Invalid database operation`,
      400,
      'VALIDATION_ERROR'
    );
  }
  
  // Standard Error objects
  if (err instanceof Error) {
    // Check for specific error messages that indicate client errors
    const message = err.message.toLowerCase();
    if (message.includes('unauthorized') || message.includes('not authenticated')) {
      return errorResponse(`${prefix}${err.message}`, 401, 'UNAUTHORIZED');
    }
    if (message.includes('forbidden') || message.includes('no permission')) {
      return errorResponse(`${prefix}${err.message}`, 403, 'FORBIDDEN');
    }
    if (message.includes('not found')) {
      return errorResponse(`${prefix}${err.message}`, 404, 'NOT_FOUND');
    }
    
    // Generic error
    return errorResponse(
      `${prefix}${err.message}`,
      500,
      'INTERNAL_ERROR'
    );
  }
  
  // Unknown error type
  return errorResponse(
    `${prefix}An unexpected error occurred`,
    500,
    'UNKNOWN_ERROR',
    { error: String(err) }
  );
}

/**
 * Async handler wrapper to catch errors
 */
export function asyncHandler<T = any>(
  handler: (req: Request, context?: any) => Promise<NextResponse<T>>
) {
  return async (req: Request, context?: any): Promise<NextResponse<T | ApiError>> => {
    try {
      return await handler(req, context);
    } catch (err) {
      return handleApiError(err);
    }
  };
}

/**
 * Rate limit error
 */
export function rateLimitError(retryAfter?: number): NextResponse<ApiError> {
  return errorResponse(
    'Too many requests. Please try again later.',
    429,
    'RATE_LIMIT_EXCEEDED',
    retryAfter ? { retryAfter } : undefined
  );
}

/**
 * Authentication error
 */
export function authError(message: string = 'Authentication required'): NextResponse<ApiError> {
  return errorResponse(message, 401, 'UNAUTHORIZED');
}

/**
 * Authorization error
 */
export function forbiddenError(message: string = 'Access forbidden'): NextResponse<ApiError> {
  return errorResponse(message, 403, 'FORBIDDEN');
}

/**
 * Not found error
 */
export function notFoundError(resource: string = 'Resource'): NextResponse<ApiError> {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND');
}

/**
 * Validation error
 */
export function validationError(message: string, details?: any): NextResponse<ApiError> {
  return errorResponse(message, 400, 'VALIDATION_ERROR', details);
}

/**
 * Server error
 */
export function serverError(message: string = 'Internal server error'): NextResponse<ApiError> {
  return errorResponse(message, 500, 'INTERNAL_ERROR');
}

/**
 * Simple alias exports for cleaner imports
 * v0.30.4 - Infrastructure Refactor
 */
export const apiSuccess = successResponse;
export const apiError = errorResponse;


