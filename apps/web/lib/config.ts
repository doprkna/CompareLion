// apps/web/lib/config.ts
// Centralized config for question generation and scheduling

/** Parse an env var as number with default */
function parseEnvNumber(key: string, defaultVal: number): number {
  const raw = process.env[key];
  if (!raw) return defaultVal;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

/** Parse duration strings like "15m", "1h" into milliseconds */
function parseDuration(str: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(str.trim());
  if (!match) {
    throw new Error(`Invalid duration string: ${str}`);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case 'ms': return value;
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value;
  }
}

// Environment variables with defaults
export const QGEN_BATCH_SIZE = parseEnvNumber('QGEN_BATCH_SIZE', 50);
export const QGEN_MAX_DAILY = parseEnvNumber('QGEN_DAILY_LIMIT', 200);
export const SCHEDULER_INTERVAL_MS = parseDuration(process.env.SCHEDULER_INTERVAL || '15m');
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Email configuration
export const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
export const APP_MAIL_FROM = process.env.APP_MAIL_FROM || 'noreply@example.com';
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Newsletter provider configuration
export const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY || '';
export const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY || '';

// Security configuration
export const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL || '';
export const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET || '';
export const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '';

// Admin configuration
export const ADMIN_EMAILS = process.env.ADMIN_EMAILS || '';

// Observability configuration
export const SENTRY_DSN = process.env.SENTRY_DSN || '';
export const SENTRY_ORG = process.env.SENTRY_ORG || '';
export const SENTRY_PROJECT = process.env.SENTRY_PROJECT || '';
export const NEXT_PUBLIC_SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
export const GIT_SHA = process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || '';
