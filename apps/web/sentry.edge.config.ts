import * as Sentry from '@sentry/nextjs';

if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
  console.log("Sentry disabled (no DSN)");
} else {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',
    
    // Set release version
    release: process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    
    // Set environment
    environment: process.env.NODE_ENV || 'development',
    
    // Add custom tags
    initialScope: {
      tags: {
        component: 'edge',
      },
    },
  });
}
