/**
 * Season Claim API
 * v0.36.23 - Season Pass System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { claimSeasonReward } from '@/lib/season/service';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * POST /api/season/claim
 * Claim a season reward
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const { tier, track, seasonId } = body;

  if (!tier || !track || !seasonId) {
    return validationError('Missing required fields: tier, track, seasonId');
  }

  if (track !== 'free' && track !== 'premium') {
    return validationError('Track must be "free" or "premium"');
  }

  const result = await claimSeasonReward(user.id, seasonId, tier, track);

  if (!result.success) {
    return validationError(result.error || 'Failed to claim reward');
  }

  return successResponse({
    success: true,
    tier,
    track,
  });
});


