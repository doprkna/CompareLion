/**
 * Centralized Safe Environment Loader
 * v0.35.17b - Build-safe env var handling with fallbacks
 */

function safeEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (!value) {
    const msg = `⚠️ Missing env var: ${name}`;
    if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
      console.warn(`${msg} – using fallback (${fallback ?? "undefined"})`);
    } else {
      console.warn(`${msg} – development fallback applied`);
    }
    return fallback ?? "";
  }
  return value;
}

// Required in production runtime (not build)
const requiredInRuntime = [
  "DATABASE_URL",
  "STRIPE_SECRET_KEY",
  "REDIS_URL",
];

// ✅ Centralized export of all env vars
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  IS_PROD: process.env.NODE_ENV === "production",
  IS_VERCEL: process.env.VERCEL === "1",
  
  // Database
  DATABASE_URL: safeEnv("DATABASE_URL", "file:./dev.db"),
  
  // Redis
  REDIS_URL: safeEnv("REDIS_URL", "redis://localhost:6379"),
  
  // Stripe
  STRIPE_SECRET_KEY: safeEnv("STRIPE_SECRET_KEY", "dummy_stripe_key"),
  STRIPE_PUBLISHABLE_KEY: safeEnv("STRIPE_PUBLISHABLE_KEY", "dummy_stripe_pk"),
  
  // Auth
  NEXTAUTH_SECRET: safeEnv("NEXTAUTH_SECRET", "dummy_secret_for_dev_only"),
  NEXTAUTH_URL: safeEnv("NEXTAUTH_URL", "http://localhost:3000"),
  
  // Email
  RESEND_API_KEY: safeEnv("RESEND_API_KEY", "dummy_resend_key"),
  
  // OpenAI (optional)
  OPENAI_API_KEY: safeEnv("OPENAI_API_KEY", ""),
  
  // App Config
  APP_URL: safeEnv("APP_URL", "http://localhost:3000"),
};

// Environment status helpers
export const isProd = process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_APP_ENV === "production";
export const hasDb = Boolean(process.env.DATABASE_URL);
export const hasRedis = Boolean(process.env.REDIS_URL) || (Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN));

// Optional runtime validation for required vars (skipped in build)
if (env.IS_PROD && !env.IS_VERCEL) {
  for (const key of requiredInRuntime) {
    if (!process.env[key]) {
      console.error(`❌ Fatal: missing required env var ${key}`);
      process.exit(1);
    }
  }
}



export function getEnvStamp(): 'PROD' | 'DEV' | 'STAGE' { // sanity-fix
  const env = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  if (env.startsWith('prod')) return 'PROD';
  if (env.startsWith('stag')) return 'STAGE';
  return 'DEV';
}

// Type helper for strict checking
export type Env = typeof env;
