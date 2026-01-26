/**
 * BattlePass Claim API
 * POST /api/battlepass/claim - Claim tier reward
 * v0.36.28 - BattlePass 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { claimBattlePassReward, claimAllAvailableRewards } from '@/lib/services/battlepassService';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const ClaimSchema = z.object({
  tier: z.number().int().positive().optional(),
  track: z.enum(['free', 'premium']).optional(),
  claimAll: z.boolean().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const validation = ClaimSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data');
  }

  const { tier, track, claimAll } = validation.data;

  if (claimAll) {
    const result = await claimAllAvailableRewards(user.id);
    return successResponse(result);
  }

  if (!tier || !track) {
    return validationError('Tier and track required');
  }

  const result = await claimBattlePassReward(user.id, tier, track);

  if (!result.success) {
    return validationError(result.error || 'Failed to claim reward');
  }

  return successResponse(result);
});

