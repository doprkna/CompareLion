import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

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
export function captureError(error: Error, context: ErrorContext = {}): void {
  // Only send to Sentry in production with DSN configured
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      // Set request ID as tag
      if (context.requestId) {
        scope.setTag('requestId', context.requestId);
      }

      // Set user context
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }

      // Set request context
      if (context.endpoint || context.method || context.ip || context.userAgent) {
        scope.setContext('request', {
          endpoint: context.endpoint,
          method: context.method,
          ip: context.ip,
          userAgent: context.userAgent,
        });
      }

      // Set additional context
      if (context.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      // Capture the error
      Sentry.captureException(error);
    });
  }

  // Also log to console for development
  if (process.env.NODE_ENV === 'development') {
    logger.error('Error captured', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }
}

/**
 * Capture message with Sentry and request context (production only - v0.35.7)
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context: ErrorContext = {}): void {
  // Only send to Sentry in production with DSN configured
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      // Set request ID as tag
      if (context.requestId) {
        scope.setTag('requestId', context.requestId);
      }

      // Set user context
      if (context.userId) {
        scope.setUser({ id: context.userId });
      }

      // Set request context
      if (context.endpoint || context.method || context.ip || context.userAgent) {
        scope.setContext('request', {
          endpoint: context.endpoint,
          method: context.method,
          ip: context.ip,
          userAgent: context.userAgent,
        });
      }

      // Set additional context
      if (context.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      // Capture the message
      Sentry.captureMessage(message, level);
    });
  }

  // Also log to console for development
  if (process.env.NODE_ENV === 'development') {
  }
}

/**
 * Extract IP address from request
 */
export function extractIpFromRequest(req: Request): string {
  return (
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent from request
 */
export function extractUserAgentFromRequest(req: Request): string {
  return req.headers.get('user-agent') || 'unknown';
}

/**
 * Create error context from request
 */
export function createErrorContextFromRequest(req: Request, requestId?: string): ErrorContext {
  return {
    requestId,
    endpoint: req.url,
    method: req.method,
    userAgent: extractUserAgentFromRequest(req),
    ip: extractIpFromRequest(req),
  };
}
