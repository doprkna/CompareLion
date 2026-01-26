/**
 * AURE Interaction Engine - Faction Battles API
 * Placeholder endpoint (use /current for actual battle)
 * v0.39.2 - AURE Interaction Engine
 */

import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-handler';

/**
 * GET /api/aure/interaction/battles
 * Placeholder endpoint - use /current for actual battle
 */
export const GET = async (req: NextRequest) => {
  return successResponse({
    message: 'Use /api/aure/interaction/battles/current for current battle',
  });
};

