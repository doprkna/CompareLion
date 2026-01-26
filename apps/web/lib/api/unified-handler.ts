/**
 * Unified API Handler
 * Enhanced error handling with logging and consistent responses
 * v0.32.4 - Error Handling & Admin Toast System Cleanup
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@parel/core/utils/debug';

/**
 * Generic API handler wrapper
 * Catches all errors and returns proper JSON responses
 * Ensures errors never silently fail
 */
export async function handle<T = any>(
  fn: () => Promise<NextResponse<T>>
): Promise<NextResponse<T> | NextResponse> {
  try {
    return await fn();
  } catch (err) {
    // Log error with stack trace
    logger.error('[API ERROR]', err);
    console.error('[API ERROR]', err);

    // Extract error message
    const errorMessage = err instanceof Error ? err.message : 'Server error';
    const errorStack = err instanceof Error ? err.stack : undefined;

    // Log stack trace in development
    if (process.env.NODE_ENV === 'development' && errorStack) {
      console.error('[API ERROR STACK]', errorStack);
    }

    // Return consistent error response
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && errorStack && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

/**
 * Handler with request context
 * Logs request details before handling
 */
export async function handleWithContext<T = any>(
  req: NextRequest,
  fn: () => Promise<NextResponse<T>>
): Promise<NextResponse<T> | NextResponse> {
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;

  try {
    logger.info(`[API ${method}] ${url} - Started`);
    const response = await fn();
    const duration = Date.now() - startTime;
    logger.info(`[API ${method}] ${url} - Completed in ${duration}ms`);
    return response;
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error(`[API ${method}] ${url} - Failed after ${duration}ms`, err);
    console.error(`[API ${method}] ${url} - Error:`, err);

    const errorMessage = err instanceof Error ? err.message : 'Server error';
    const errorStack = err instanceof Error ? err.stack : undefined;

    if (process.env.NODE_ENV === 'development' && errorStack) {
      console.error('[API ERROR STACK]', errorStack);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && errorStack && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

/**
 * Async operation wrapper for use in API routes
 * Similar to handle() but can be used inline
 */
export async function tryAsync<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (err) {
    const error = err instanceof Error ? err.message : errorMessage;
    logger.error('[ASYNC ERROR]', err);
    return { success: false, error };
  }
}

