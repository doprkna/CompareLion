import { NextRequest } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess } from '@parel/api';
import type { PingDataDTO } from '@parel/types/dto';

/**
 * Ping Endpoint
 * Simple connectivity check
 * v0.41.2 - C3 Step 3: Unified API envelope
 * v0.41.8 - C3 Step 9: DTO Consolidation Batch #1
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const pingData: PingDataDTO = { status: 'ok' };
  return buildSuccess(req, pingData);
});
