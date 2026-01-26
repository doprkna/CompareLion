/**
 * Ads Reward API
 * v0.36.22 - Ads Integration
 * 
 * Handles rewarded ad claims with cooldown
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { logger } from '@/lib/logger';
import { addXP } from '@/lib/services/progressionService';

export const runtime = 'nodejs';

const REWARD_COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
const REWARD_XP = 20;
const REWARD_GOLD = 10;

/**
 * POST /api/ads/reward
 * Claim reward from watching an ad
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, funds: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const { type } = body;

  if (!type || (type !== 'xp' && type !== 'gold')) {
    return validationError('Invalid reward type. Must be "xp" or "gold"');
  }

  // Check cooldown (last reward time stored in AdsLog table)
  // Gracefully handle if AdsLog model doesn't exist yet
  let lastReward = null;
  try {
    lastReward = await prisma.adsLog.findFirst({
      where: {
        userId: user.id,
        type: type,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    // AdsLog model may not exist yet - log and continue
    logger.warn('[AdsReward] AdsLog model not found, skipping cooldown check', error);
  }

  if (lastReward) {
    const timeSinceLastReward = Date.now() - lastReward.createdAt.getTime();
    if (timeSinceLastReward < REWARD_COOLDOWN_MS) {
      const minutesRemaining = Math.ceil((REWARD_COOLDOWN_MS - timeSinceLastReward) / 60000);
      return validationError(`Cooldown active. Please wait ${minutesRemaining} more minute(s).`);
    }
  }

  // Grant reward
  try {
    if (type === 'xp') {
      await addXP(user.id, REWARD_XP, 'ad_reward');
    } else if (type === 'gold') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          funds: { increment: REWARD_GOLD },
        },
      });
    }

    // Log reward (gracefully handle if AdsLog model doesn't exist)
    try {
      await prisma.adsLog.create({
        data: {
          userId: user.id,
          type: type,
        },
      });
    } catch (error) {
      // AdsLog model may not exist yet - log warning but don't fail
      logger.warn('[AdsReward] Failed to log reward (AdsLog model may not exist)', error);
    }

    logger.info(`[AdsReward] User ${user.id} claimed ${type} reward`);

    return successResponse({
      success: true,
      rewardType: type,
      amount: type === 'xp' ? REWARD_XP : REWARD_GOLD,
    });
  } catch (error) {
    logger.error('[AdsReward] Failed to grant reward', error);
    return validationError('Failed to grant reward. Please try again.');
  }
});

