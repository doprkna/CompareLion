/**
 * Mission Claim API
 * POST /api/missions/claim
 * Claims rewards for a completed mission
 * v0.36.36 - Missions & Quests 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';
import { claimMissionReward } from '@/lib/missions/rewardService';

export const runtime = 'nodejs';

const ClaimMissionSchema = z.object({
  missionProgressId: z.string().min(1),
});

/**
 * POST /api/missions/claim
 * Claims rewards for a completed mission
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
  const parsed = ClaimMissionSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid payload', parsed.error.issues);
  }

  const { missionProgressId } = parsed.data;

  // Claim reward using reward service
  const result = await claimMissionReward(user.id, missionProgressId);

  if (!result.success) {
    return validationError(result.error || 'Failed to claim reward');
  }

  return successResponse({
    success: true,
    rewards: result.rewards,
  });
});

