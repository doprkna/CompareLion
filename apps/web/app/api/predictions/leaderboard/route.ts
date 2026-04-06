/**
 * GET /api/predictions/leaderboard
 */
import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-handler';
import { getPredictionLeaderboard } from '@/lib/services/predictionService';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

  const items = await getPredictionLeaderboard({ limit });
  return successResponse({ items });
}
