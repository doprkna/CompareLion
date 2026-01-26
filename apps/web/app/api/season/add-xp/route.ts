/**
 * Season Add XP API
 * v0.36.23 - Season Pass System
 * 
 * Internal endpoint - called by fight engine after combat
 */

import { NextRequest } from 'next/server';
import { addSeasonXP } from '@/lib/season/service';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/season/add-xp
 * Add XP to user's season progress
 * Internal use - requires userId in body or header
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { userId, xp } = body;

  if (!userId || !xp) {
    return validationError('Missing required fields: userId, xp');
  }

  if (typeof xp !== 'number' || xp <= 0) {
    return validationError('XP must be a positive number');
  }

  const result = await addSeasonXP(userId, xp);

  return successResponse({
    success: true,
    tieredUp: result.tieredUp,
    newTier: result.newTier,
  });
});


