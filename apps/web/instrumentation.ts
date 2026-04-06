/**
 * Next.js Instrumentation Hook
 * Runs once when the server starts
 */

import { logger } from '@/lib/logger';
import { isObservabilityEnabled } from '@/lib/observability/isObservabilityEnabled';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize unified config before any request (needed by hooks, flags, etc.)
    const { ensureUnifiedConfigInitialized } = await import('@parel/core/config/unified');
    ensureUnifiedConfigInitialized();
    // Schema drift guard (DEV only - validates critical columns exist)
    if ((process.env.APP_ENV ?? 'dev') === 'dev' && process.env.NODE_ENV === 'development') {
      const { validateSchema } = await import('@parel/db/dev/schemaGuard');
      await validateSchema();
    }
    // Redis status (dev only, once)
    if (process.env.NODE_ENV === 'development') {
      try {
        const { hasRedis } = await import('@parel/redis');
        logger.info(hasRedis ? 'Redis: enabled' : 'Redis: disabled (no REDIS_URL)');
      } catch {}
    }
    // Register all cron jobs (v0.33.4 - dynamic import to avoid webpack bundling issues)
    try {
      const { registerAllCronJobs } = await import('@/lib/cron/config');
      registerAllCronJobs();
      // logger.info('[Cron] Registered all cron jobs'); // Disabled in v0.35.7
    } catch (err) {
      logger.warn('[Cron] Failed to register cron jobs:', err);
    }
    // Initialize Sentry for server-side monitoring (observability disabled in dev - v0.45.25)
    if (isObservabilityEnabled() && process.env.NEXT_PUBLIC_SENTRY_DSN) {
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
    
    // Server startup message (disabled in v0.35.7 to reduce console spam)
    // if (process.env.NODE_ENV === 'development') {
    //   const port = process.env.PORT || 3000;
    //   const env = process.env.NODE_ENV || 'development';
    //   
    //   logger.info('\n🟢 ═══════════════════════════════════════════════════');
    //   logger.info(`🟢 PareL App online at http://localhost:${port}`);
    //   logger.info(`🟢 Environment: ${env}`);
    //   logger.info('🟢 ═══════════════════════════════════════════════════\n');
    // }
  }
  
  // Edge runtime initialization (observability disabled in dev - v0.45.25)
  if (process.env.NEXT_RUNTIME === 'edge') {
    if (isObservabilityEnabled() && process.env.NEXT_PUBLIC_SENTRY_DSN) {
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
