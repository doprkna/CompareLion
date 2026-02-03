/**
 * Error Tracking System (v0.11.3)
 *
 * Unified error tracking with Sentry integration.
 */
/**
 * Error severity levels
 */
export declare enum ErrorSeverity {
    DEBUG = "debug",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    FATAL = "fatal"
}
/**
 * Error context
 */
export interface ErrorContext {
    userId?: string;
    endpoint?: string;
    action?: string;
    metadata?: Record<string, any>;
}
/**
 * Capture error with context
 */
export declare function captureError(error: Error, context?: ErrorContext, severity?: ErrorSeverity): string | null;
/**
 * Capture message (non-error)
 */
export declare function captureMessage(message: string, context?: ErrorContext, severity?: ErrorSeverity): void;
/**
 * Set user context for error tracking
 */
export declare function setUserContext(userId: string, email?: string, username?: string): void;
/**
 * Clear user context
 */
export declare function clearUserContext(): void;
/**
 * Add breadcrumb for debugging
 */
export declare function addBreadcrumb(message: string, category?: string, level?: ErrorSeverity, data?: Record<string, any>): void;
/**
 * Performance monitoring
 */
export declare function startTransaction(name: string, operation: string): any;
/**
 * Wrap async function with error tracking
 */
export declare function withErrorTracking<T extends (...args: any[]) => Promise<any>>(fn: T, context?: ErrorContext): T;
