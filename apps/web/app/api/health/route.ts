/**
 * Health Check Endpoint
 * Lightweight edge runtime check for deployment status
 * v0.35.16d - Vercel production stability
 * v0.41.1 - C3 Step 2: Unified API envelope
 * v0.41.8 - C3 Step 9: DTO Consolidation Batch #1
 */

import { NextRequest, NextResponse } from 'next/server';
import { isProd, hasDb, hasRedis } from '@/lib/env';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const version = process.env.APP_VERSION || process.env.GIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';
    
    return NextResponse.json({
      ok: true,
      env: {
        isProd,
        hasDb,
        hasRedis,
      },
      version,
    }, { status: 200 });
  } catch (error) {
    // Never throw - always return 200
    return NextResponse.json({
      ok: false,
      env: {
        isProd: false,
        hasDb: false,
        hasRedis: false,
      },
      version: 'unknown',
      error: 'health_check_failed',
    }, { status: 200 });
  }
}
