/**
 * Next.js Client-side Instrumentation
 * Runs once when the client bundle loads
 */

import * as Sentry from '@sentry/nextjs';

// Export router transition hook for Sentry navigation tracking
export const onRouterTransitionStart = process.env.NEXT_PUBLIC_SENTRY_DSN 
  ? Sentry.captureRouterTransitionStart 
  : undefined;

// Initialize Sentry for client-side monitoring
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      
      // Adjust sample rate based on environment
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Session replay
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.1,
      
      // Set environment and release info
      environment: process.env.NODE_ENV || 'development',
      
      // Enable session replay
      integrations: [
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      
      // Filter out noisy browser errors
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
}

