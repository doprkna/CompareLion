/**
 * Error Handling Utility Layer
 *
 * Provides centralized error handling with:
 * - Custom AppError class for structured errors
 * - logError function for consistent error logging
 * - safe() wrapper for error-safe execution
 */
export declare class AppError extends Error {
    message: string;
    _code?: string | undefined;
    _context?: Record<string, unknown> | undefined;
    constructor(message: string, _code?: string | undefined, _context?: Record<string, unknown> | undefined);
}
/**
 * Log errors with context
 * - In development: Always logs to console
 * - In production: Only logs if NEXT_PUBLIC_VERBOSE_ERRORS=true
 * - Placeholder for Sentry integration
 */
export declare function logError(err: unknown, context: string): void;
/**
 * Safe execution wrapper
 * Executes a function and returns null on error instead of throwing
 *
 * @example
 * const result = safe(() => JSON.parse(data));
 * if (!result) { // handle error }
 */
export declare function safe<T>(fn: () => T): T | null;
/**
 * Async safe execution wrapper
 * Similar to safe() but for async functions
 */
export declare function safeAsync<T>(fn: () => Promise<T>): Promise<T | null>;
