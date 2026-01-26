export interface ErrorContext {
    requestId?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    extra?: Record<string, any>;
}
/**
 * Capture error with Sentry and request context (production only - v0.35.7)
 */
export declare function captureError(error: Error, context?: ErrorContext): void;
/**
 * Capture message with Sentry and request context (production only - v0.35.7)
 */
export declare function captureMessage(message: string, level?: 'info' | 'warning' | 'error', context?: ErrorContext): void;
/**
 * Extract IP address from request
 */
export declare function extractIpFromRequest(req: Request): string;
/**
 * Extract user agent from request
 */
export declare function extractUserAgentFromRequest(req: Request): string;
/**
 * Create error context from request
 */
export declare function createErrorContextFromRequest(req: Request, requestId?: string): ErrorContext;
