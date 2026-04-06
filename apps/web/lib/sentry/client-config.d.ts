/**
 * Sentry Client Configuration (v0.14.0)
 * Production-only error tracking
 */
export declare function initSentry(): void;
/**
 * Capture error manually
 */
export declare function captureError(error: Error, context?: Record<string, any>): void;
/**
 * Set user context (hashed for privacy)
 */
export declare function setUserContext(userId?: string): void;
