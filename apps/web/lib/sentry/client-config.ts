/**
 * Sentry Client Configuration (v0.14.0)
 * Production-only error tracking
 */

import * as Sentry from '@sentry/nextjs';
import { getRuntimeInfo } from '@/lib/build-info';
import { logger } from '@/lib/logger';

let initialized = false;

export function initSentry() {
  // Only in production and if DSN is configured
  if (
    process.env.NODE_ENV !== 'production' ||
    !process.env.NEXT_PUBLIC_SENTRY_DSN ||
    initialized
  ) {
    return;
  }

  const buildInfo = getRuntimeInfo();

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Sample rate for production
    tracesSampleRate: 0.1,
    
    // Release and environment
    environment: process.env.NODE_ENV,
    release: buildInfo.commit,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Session replay sample rate
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter noisy errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      if (error instanceof Error) {
        // Skip known non-critical errors
        if (
          error.message.includes('ResizeObserver loop') ||
          error.message.includes('Non-Error promise rejection') ||
          error.message.includes('Network request failed')
        ) {
          return null;
        }
      }
      
      return event;
    },
    
    // Tag events with additional context
    beforeSendTransaction(event) {
      event.tags = {
        ...event.tags,
        buildId: buildInfo.commit,
        environment: process.env.NODE_ENV,
      };
      return event;
    },
  });

  initialized = true;
}

/**
 * Capture error manually
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV !== 'production') {
    logger.error('[Sentry] Error', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Set user context (hashed for privacy)
 */
export function setUserContext(userId?: string) {
  if (process.env.NODE_ENV !== 'production' || !userId) {
    return;
  }

  // Hash userId for privacy
  const hashedUserId = hashUserId(userId);
  
  Sentry.setUser({
    id: hashedUserId,
  });
}

/**
 * Simple hash function for user ID
 */
function hashUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash)}`;
}

