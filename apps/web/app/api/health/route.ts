/**
 * Health Check Endpoint
 * Lightweight edge runtime check for deployment status
 * v0.35.16d - Vercel production stability
 * v0.41.1 - C3 Step 2: Unified API envelope
 * v0.41.8 - C3 Step 9: DTO Consolidation Batch #1
 */

import { NextRequest } from 'next/server';
import { buildSuccess } from '@parel/api';
import type { HealthDataDTO } from '@parel/types/dto';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const healthData: HealthDataDTO = {
    ok: true,
    status: 'healthy',
    version: process.env.APP_VERSION || '0.41.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  };

  return buildSuccess(req, healthData, {
    version: process.env.APP_VERSION || '0.41.1',
  });
}
