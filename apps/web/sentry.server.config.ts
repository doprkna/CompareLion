import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Capture unhandled promise rejections
  captureUnhandledRejections: true,
  
  // Set release version
  release: process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  
  // Set environment
  environment: process.env.NODE_ENV || 'development',
  
  // Filter out noisy errors
  beforeSend(event, hint) {
    // Filter out common server errors that are not actionable
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
  
  // Add custom tags
  initialScope: {
    tags: {
      component: 'server',
    },
  },
});
