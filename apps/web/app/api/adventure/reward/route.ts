/**
 * Adventure Reward Node API
 * v0.36.16 - Adventure Mode v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { advanceAdventure, getCurrentNode } from '@/lib/rpg/adventure';
import { prisma } from '@/lib/db';
import { addXP } from '@/lib/services/progressionService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/adventure/reward
 * Claim reward from reward node and advance
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

  // Get current node
  const state = await getCurrentNode(user.id);

  if (!state || !state.currentNode || state.currentNode.type !== 'reward') {
    return unauthorizedError('No reward node available');
  }

  const rewardData = state.currentNode.data;
  const rewards: { gold?: number; xp?: number; epicChance?: boolean } = {};

  // Grant rewards
  if (rewardData.gold) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        funds: { increment: rewardData.gold },
      },
    });
    rewards.gold = rewardData.gold;
  }

  if (rewardData.xp) {
    await addXP(user.id, rewardData.xp, 'adventure-reward');
    rewards.xp = rewardData.xp;
  }

  if (rewardData.epicChance) {
    // TODO: Implement epic item drop logic
    rewards.epicChance = true;
    logger.info(`[Adventure] Epic chance reward for user ${user.id}`);
  }

  // Advance to next node
  const nextState = await advanceAdventure(user.id);

  return successResponse({
    rewards,
    nextState,
  });
});

