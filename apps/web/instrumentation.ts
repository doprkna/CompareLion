/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 */

import { logger } from '@/lib/logger';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Register all cron jobs (v0.33.4 - dynamic import to avoid webpack bundling issues)
    try {
      const { registerAllCronJobs } = await import('@/lib/cron/config');
      registerAllCronJobs();
      logger.info('[Cron] Registered all cron jobs');
    } catch (err) {
      logger.warn('[Cron] Failed to register cron jobs:', err);
    }
    // Initialize Sentry for server-side monitoring
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        
        // Adjust sample rate based on environment
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Set environment and release info
        environment: process.env.NODE_ENV || 'development',
        release: process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        
        // Debugging in development only
        debug: process.env.NODE_ENV === 'development',
        
        // Filter out noisy errors
        beforeSend(event, hint) {
          if (event.exception) {
            const error = hint.originalException;
            if (error instanceof Error) {
              if (
                error.message.includes('EPERM: operation not permitted') ||
                error.message.includes('PrismaClientInitializationError') ||
                error.message.includes('RangeError [ERR_SOCKET_BAD_PORT]')
              ) {
                return null;
              }
            }
          }
          return event;
        },
      });
    }
    
    // Server startup message (development only)
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 3000;
      const env = process.env.NODE_ENV || 'development';
      
      logger.info('\n🟢 ═══════════════════════════════════════════════════');
      logger.info(`🟢 PareL App online at http://localhost:${port}`);
      logger.info(`🟢 Environment: ${env}`);
      logger.info('🟢 ═══════════════════════════════════════════════════\n');
    }
  }
  
  // Edge runtime initialization
  if (process.env.NEXT_RUNTIME === 'edge') {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs');
      
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        environment: process.env.NODE_ENV || 'development',
        release: process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      });
    }
  }
}
