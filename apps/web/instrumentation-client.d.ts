/**
 * Next.js Client-side Instrumentation
 * Runs once when the client bundle loads
 */
import * as Sentry from '@sentry/nextjs';
export declare const onRouterTransitionStart: typeof Sentry.captureRouterTransitionStart | undefined;
