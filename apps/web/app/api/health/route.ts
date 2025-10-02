export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRequestId, addRequestIdToResponse } from '@/lib/utils/requestId';
import * as Sentry from "@sentry/nextjs";

interface HealthStatus {
  ok: boolean;
  db: boolean;
  stripe: boolean;
  redis: boolean;
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  requestId: string;
  error?: string;
}

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    Sentry.captureException(error, { 
      extra: { 
        component: 'health-check',
        check: 'database'
      } 
    });
    return false;
  }
}

async function checkStripe(): Promise<boolean> {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return false; // Stripe not configured
    }

    // Simple check - we could make a test API call but this is more lightweight
    return stripeKey.startsWith('sk_') && stripeKey.length > 20;
  } catch (error) {
    console.error('Stripe health check failed:', error);
    Sentry.captureException(error, { 
      extra: { 
        component: 'health-check',
        check: 'stripe'
      } 
    });
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (!redisUrl || !redisToken) {
      return false; // Redis not configured
    }

    // For now, just check if credentials are properly formatted
    return redisUrl.includes('upstash.io') && redisToken.length > 10;
  } catch (error) {
    console.error('Redis health check failed:', error);
    Sentry.captureException(error, { 
      extra: { 
        component: 'health-check',
        check: 'redis'
      } 
    });
    return false;
  }
}

function getGitSha(): string {
  // Try to get git SHA from environment variable first
  const gitSha = process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA;
  if (gitSha) {
    return gitSha.substring(0, 7); // Return short SHA
  }

  // Fallback to package version
  return process.env.npm_package_version || 'unknown';
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const requestId = getRequestId(req);
  
  try {
    // Run health checks in parallel for better performance
    const [db, stripe, redis] = await Promise.all([
      checkDatabase(),
      checkStripe(),
      checkRedis(),
    ]);

    const healthStatus: HealthStatus = {
      ok: db, // Primary health is based on database availability
      db,
      stripe,
      redis,
      version: getGitSha(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      requestId,
    };

    // Determine HTTP status code
    const statusCode = healthStatus.ok ? 200 : 503;

    const response = NextResponse.json(healthStatus, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      }
    });
    
    return addRequestIdToResponse(response, requestId);
  } catch (error) {
    console.error('Health check error:', error);
    
    // Capture error with Sentry
    Sentry.captureException(error, { extra: { requestId } });
    
    const errorResponse = {
      ok: false,
      db: false,
      stripe: false,
      redis: false,
      version: getGitSha(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      error: 'Health check failed',
      requestId,
    };

    const response = NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      }
    });
    
    return addRequestIdToResponse(response, requestId);
  }
}
