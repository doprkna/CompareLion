/**
 * Error Tracking System (v0.11.3)
 *
 * Unified error tracking with Sentry integration.
 */
import * as Sentry from "@sentry/nextjs";
import { getCorrelationIdFromContext } from "./correlation-id";
import { logger } from "@/lib/logger";
/**
 * Error severity levels
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["DEBUG"] = "debug";
    ErrorSeverity["INFO"] = "info";
    ErrorSeverity["WARNING"] = "warning";
    ErrorSeverity["ERROR"] = "error";
    ErrorSeverity["FATAL"] = "fatal";
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * Capture error with context
 */
export function captureError(error, context = {}, severity = ErrorSeverity.ERROR) {
    const correlationId = getCorrelationIdFromContext();
    // Add correlation ID to context
    const fullContext = {
        ...context,
        correlationId,
        timestamp: new Date().toISOString(),
    };
    // Log to console
    logger.error("[ErrorTracker]", {
        message: error.message,
        stack: error.stack,
        ...fullContext,
    });
    // Send to Sentry if configured (production only - v0.35.7)
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(error, {
            level: severity,
            contexts: {
                app: fullContext,
            },
            tags: {
                correlationId: correlationId || "unknown",
                userId: context.userId,
                endpoint: context.endpoint,
                action: context.action,
            },
        });
    }
    return correlationId;
}
/**
 * Capture message (non-error)
 */
export function captureMessage(message, context = {}, severity = ErrorSeverity.INFO) {
    const correlationId = getCorrelationIdFromContext();
    const fullContext = {
        ...context,
        correlationId,
        timestamp: new Date().toISOString(),
    };
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureMessage(message, {
            level: severity,
            contexts: {
                app: fullContext,
            },
            tags: {
                correlationId: correlationId || "unknown",
            },
        });
    }
}
/**
 * Set user context for error tracking
 */
export function setUserContext(userId, email, username) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.setUser({
            id: userId,
            email,
            username,
        });
    }
}
/**
 * Clear user context
 */
export function clearUserContext() {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.setUser(null);
    }
}
/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message, category = "default", level = ErrorSeverity.INFO, data) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.addBreadcrumb({
            message,
            category,
            level: level,
            data,
            timestamp: Date.now() / 1000,
        });
    }
}
/**
 * Performance monitoring
 */
export function startTransaction(name, operation) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        return Sentry.startTransaction({
            name,
            op: operation,
        });
    }
    return null;
}
/**
 * Wrap async function with error tracking
 */
export function withErrorTracking(fn, context = {}) {
    return (async (...args) => {
        try {
            return await fn(...args);
        }
        catch (error) {
            captureError(error instanceof Error ? error : new Error(String(error)), context);
            throw error;
        }
    });
}
