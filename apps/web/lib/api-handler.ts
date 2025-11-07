/**
 * Unified API Handler
 * Provides safeAsync wrapper and utilities for API routes
 * v0.13.2f - API Layer Refactor
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api/error-handler';
import { logger } from '@/lib/utils/debug';

/**
 * Safe async wrapper for API route handlers
 * Catches all errors and returns proper JSON responses
 */
export const safeAsync = <T = any>(
  fn: (req: NextRequest, context?: any) => Promise<NextResponse<T>>
) => {
  return async (req: NextRequest, context?: any): Promise<NextResponse<T> | NextResponse> => {
    try {
      return await fn(req, context);
    } catch (err) {
      logger.error('[API_ERROR]', err);
      return handleApiError(err);
    }
  };
};

/**
 * Helper to parse and validate JSON body
 * Returns parsed data or throws error
 */
export async function parseBody<T = any>(req: NextRequest): Promise<T> {
  try {
    return await req.json();
  } catch (err) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Helper to get search params safely
 */
export function getSearchParam(req: NextRequest, key: string): string | null {
  return req.nextUrl.searchParams.get(key);
}

/**
 * Helper to get required search param or throw
 */
export function getRequiredSearchParam(req: NextRequest, key: string): string {
  const value = req.nextUrl.searchParams.get(key);
  if (!value) {
    throw new Error(`Missing required parameter: ${key}`);
  }
  return value;
}

// Re-export common error responses for convenience
export { 
  handleApiError,
  successResponse, 
  errorResponse,
  authError as unauthorizedError, // Alias for backward compatibility
  authError,
  forbiddenError,
  notFoundError,
  validationError,
  serverError,
} from '@/lib/api/error-handler';

