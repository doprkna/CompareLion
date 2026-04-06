/**
 * Unified API Handler
 * Provides safeAsync wrapper and utilities for API routes
 * v0.13.2f - API Layer Refactor
 */
import { NextRequest, NextResponse } from 'next/server';
/**
 * Safe async wrapper for API route handlers
 * Catches all errors and returns proper JSON responses
 */
export declare const safeAsync: <T = any>(fn: (req: NextRequest, context?: any) => Promise<NextResponse<T>>) => (req: NextRequest, context?: any) => Promise<NextResponse<T> | NextResponse>;
/**
 * Helper to parse and validate JSON body
 * Returns parsed data or throws error
 */
export declare function parseBody<T = any>(req: NextRequest): Promise<T>;
/**
 * Helper to get search params safely
 */
export declare function getSearchParam(req: NextRequest, key: string): string | null;
/**
 * Helper to get required search param or throw
 */
export declare function getRequiredSearchParam(req: NextRequest, key: string): string;
/**
 * Check if database is available, return disabled response if not
 */
export declare function requireDb(req: NextRequest): NextResponse | null;
/**
 * Check if Redis is available, return disabled response if not
 */
export declare function requireRedis(req: NextRequest): NextResponse | null;
export { handleApiError, successResponse, errorResponse, authError as unauthorizedError, // Alias for backward compatibility
authError, forbiddenError, notFoundError, validationError, serverError, } from '@/lib/api/error-handler';
