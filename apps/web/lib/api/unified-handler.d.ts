/**
 * Unified API Handler
 * Enhanced error handling with logging and consistent responses
 * v0.32.4 - Error Handling & Admin Toast System Cleanup
 */
import { NextRequest, NextResponse } from 'next/server';
/**
 * Generic API handler wrapper
 * Catches all errors and returns proper JSON responses
 * Ensures errors never silently fail
 */
export declare function handle<T = any>(fn: () => Promise<NextResponse<T>>): Promise<NextResponse<T> | NextResponse>;
/**
 * Handler with request context
 * Logs request details before handling
 */
export declare function handleWithContext<T = any>(req: NextRequest, fn: () => Promise<NextResponse<T>>): Promise<NextResponse<T> | NextResponse>;
/**
 * Async operation wrapper for use in API routes
 * Similar to handle() but can be used inline
 */
export declare function tryAsync<T>(operation: () => Promise<T>, errorMessage?: string): Promise<{
    success: true;
    data: T;
} | {
    success: false;
    error: string;
}>;
