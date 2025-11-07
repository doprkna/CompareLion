/**
 * Environment Variable Validation
 * v0.22.6 - Centralized env validation with type safety
 */

import { z } from 'zod';
import { logger } from '@/lib/logger';

// Define environment schema with Zod
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional but recommended
  REDIS_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  GPT_GEN_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  
  // Public environment variables
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_ENV: z.enum(['development', 'beta', 'staging', 'production']).optional(),
  NEXT_PUBLIC_ALLOW_DEMO_LOGIN: z.string().optional(),
  
  // Vercel
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
});

export type EnvVars = z.infer<typeof envSchema>;

// Validate environment variables at startup
let validatedEnv: EnvVars | null = null;

export function validateEnv(): EnvVars {
  // Only validate once
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    logger.info('[ENV] Environment variables validated successfully');
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      logger.error('[ENV] Environment validation failed:', { errors: missingVars });
      
      // In development, warn but don't crash
      if (process.env.NODE_ENV === 'development') {
        logger.warn('[ENV] Running with incomplete environment (development mode)');
        return process.env as EnvVars;
      }
      
      // In production, crash immediately
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// Safe getter with validation
export function getEnv<K extends keyof EnvVars>(key: K): EnvVars[K] | undefined {
  const env = validatedEnv || validateEnv();
  return env[key];
}

// Legacy function for backward compatibility
export function getEnvStamp(): 'DEV' | 'PROD' {
  const vercelEnv = process.env.VERCEL_ENV;
  const nodeEnv = process.env.NODE_ENV;
  if (vercelEnv === 'production' || nodeEnv === 'production') {
    return 'PROD';
  }
  return 'DEV';
}

// Redact sensitive values from logs
export function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'password', 'secret', 'token', 'key', 'api_key', 'apikey',
    'auth', 'credential', 'private', 'passwordHash', 'hash',
    'stripe', 'jwt', 'bearer', 'oauth'
  ];
  
  const redacted = Array.isArray(obj) ? [...obj] : { ...obj };
  
  for (const key in redacted) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some(sk => lowerKey.includes(sk));
    
    if (isSensitive && typeof redacted[key] === 'string') {
      // Show first 4 and last 4 characters, redact middle
      const val = redacted[key];
      if (val.length > 8) {
        redacted[key] = `${val.slice(0, 4)}${'*'.repeat(val.length - 8)}${val.slice(-4)}`;
      } else {
        redacted[key] = '***REDACTED***';
      }
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveData(redacted[key]);
    }
  }
  
  return redacted;
}
