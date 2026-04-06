/**
 * Next.js Client-side Instrumentation
 * Runs once when the client bundle loads.
 * Observability disabled in dev (DISABLE_OBSERVABILITY / NODE_ENV) - v0.45.25
 */

import { isObservabilityEnabled } from '@/lib/observability/isObservabilityEnabled';

// Lazy Sentry - only loaded when observability enabled (avoids dev bundle cost)
export const onRouterTransitionStart =
  isObservabilityEnabled() && process.env.NEXT_PUBLIC_SENTRY_DSN
    ? require('@sentry/nextjs').captureRouterTransitionStart
    : undefined;

if (
  typeof window !== 'undefined' &&
  isObservabilityEnabled() &&
  process.env.NEXT_PUBLIC_SENTRY_DSN
) {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      environment: process.env.NODE_ENV || 'development',
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      beforeSend(event, hint) {
        if (event.exception) {
          const error = hint.originalException;
          if (error instanceof Error) {
            if (
              error.message.includes('Non-Error promise rejection captured') ||
              error.message.includes('ResizeObserver loop limit exceeded') ||
              error.message.includes('Script error') ||
              error.message.includes('ChunkLoadError')
            ) {
              return null;
            }
          }
        }
        return event;
      },
    });
  });
}
