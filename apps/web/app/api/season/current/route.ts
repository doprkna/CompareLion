/**
 * Current Season API
 * GET /api/season/current
 * Returns the current active season
 * v0.36.38 - Seasons & Battlepass 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getCurrentSeason } from '@/lib/seasons/seasonEngine';

export const runtime = 'nodejs';

/**
 * GET /api/season/current
 * Returns current active season or null
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const season = await getCurrentSeason();
  
  return successResponse({
    season,
  });
});
