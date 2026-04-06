/**
 * Sentry Client Configuration (v0.14.0)
 * Production-only error tracking. Observability disabled in dev - v0.45.25
 */

import { getRuntimeInfo } from '@/lib/build-info';
import { logger } from '@/lib/logger';
import { isObservabilityEnabled } from '@/lib/observability/isObservabilityEnabled';

let initialized = false;

export function initSentry() {
  if (!isObservabilityEnabled() || !process.env.NEXT_PUBLIC_SENTRY_DSN || initialized) {
    return;
  }

  import('@sentry/nextjs').then((Sentry) => {
    const buildInfo = getRuntimeInfo();
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
      release: buildInfo.commit,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
      ],
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        const error = hint.originalException;
        if (error instanceof Error) {
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
  });
}

/**
 * Capture error manually
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (!isObservabilityEnabled()) {
    logger.error('[Sentry] Error', error, context);
    return;
  }
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureException(error, { extra: context });
  });
}

/**
 * Set user context (hashed for privacy)
 */
function hashUserId(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `user_${Math.abs(hash)}`;
}

export function setUserContext(userId?: string) {
  if (!isObservabilityEnabled() || !userId) return;
  const hashedUserId = hashUserId(userId);
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.setUser({ id: hashedUserId });
  });
}
