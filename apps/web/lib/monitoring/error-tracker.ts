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
export enum ErrorSeverity {
  DEBUG = "debug",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  FATAL = "fatal",
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
export function captureError(
  error: Error,
  context: ErrorContext = {},
  severity: ErrorSeverity = ErrorSeverity.ERROR
) {
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

  // Send to Sentry if configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      level: severity as any,
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
export function captureMessage(
  message: string,
  context: ErrorContext = {},
  severity: ErrorSeverity = ErrorSeverity.INFO
) {
  const correlationId = getCorrelationIdFromContext();

  const fullContext = {
    ...context,
    correlationId,
    timestamp: new Date().toISOString(),
  };


  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level: severity as any,
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
export function setUserContext(userId: string, email?: string, username?: string) {
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
export function addBreadcrumb(
  message: string,
  category: string = "default",
  level: ErrorSeverity = ErrorSeverity.INFO,
  data?: Record<string, any>
) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level: level as any,
      data,
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * Performance monitoring
 */
export function startTransaction(name: string, operation: string) {
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
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error;
    }
  }) as T;
}













