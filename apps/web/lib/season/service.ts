/**
 * Season Pass Service
 * v0.36.23 - Season Pass System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { publishEvent } from '@/lib/realtime';

export interface SeasonProgress {
  season: {
    id: string;
    name: string;
    seasonNumber: number;
    startsAt: Date;
    endsAt: Date;
    isActive: boolean;
  };
  tiers: Array<{
    id: string;
    tier: number;
    xpRequired: number;
    freeReward: any;
    premiumReward: any;
  }>;
  userProgress: {
    xp: number;
    currentTier: number;
    claimedFreeRewards: number[];
    claimedPremiumRewards: number[];
  };
}

/**
 * Get current active season
 */
export async function getCurrentSeason(): Promise<any | null> {
  const season = await prisma.season.findFirst({
    where: { isActive: true },
    include: {
      tiers: {
        orderBy: { tier: 'asc' },
        include: {
          freeReward: true,
          premiumReward: true,
        },
      },
    },
    orderBy: { seasonNumber: 'desc' },
  });

  return season;
}

/**
 * Get user's progress for a season
 */
export async function getUserSeasonProgress(
  userId: string,
  seasonId: string
): Promise<any | null> {
  const progress = await prisma.userSeasonProgress.findUnique({
    where: {
      userId_seasonId: {
        userId,
        seasonId,
      },
    },
  });

  return progress;
}

/**
 * Add XP to user's season progress
 * Called after combat/fights
 */
export async function addSeasonXP(
  userId: string,
  xpAmount: number
): Promise<{ tieredUp: boolean; newTier?: number }> {
  try {
    // Get current active season
    const season = await getCurrentSeason();
    if (!season) {
      return { tieredUp: false };
    }

    // Get or create user progress
    let progress = await getUserSeasonProgress(userId, season.id);

    if (!progress) {
      progress = await prisma.userSeasonProgress.create({
        data: {
          userId,
          seasonId: season.id,
          xp: 0,
          currentTier: 0,
          claimedFreeRewards: [],
          claimedPremiumRewards: [],
        },
      });
    }

    // Calculate new XP
    const newXP = progress.xp + xpAmount;

    // Find current tier based on XP
    const tiers = await prisma.seasonTier.findMany({
      where: { seasonId: season.id },
      orderBy: { tier: 'desc' },
    });

    let newTier = progress.currentTier;
    let tieredUp = false;

    // Check if XP is enough for next tier
    for (const tier of tiers) {
      if (newXP >= tier.xpRequired && tier.tier > progress.currentTier) {
        newTier = tier.tier;
        tieredUp = true;
        break;
      }
    }

    // Update progress
    await prisma.userSeasonProgress.update({
      where: { id: progress.id },
      data: {
        xp: newXP,
        currentTier: newTier,
      },
    });

    // Send notification if tiered up
    if (tieredUp && newTier) {
      await publishEvent({
        userId,
        type: 'season-tier-up',
        data: {
          tier: newTier,
          seasonId: season.id,
          seasonName: season.name,
        },
      });

      logger.info(`[Season] User ${userId} reached tier ${newTier} in season ${season.id}`);
    }

    return { tieredUp, newTier };
  } catch (error) {
    logger.error('[Season] Failed to add XP', error);
    return { tieredUp: false };
  }
}

/**
 * Claim a season reward
 */
export async function claimSeasonReward(
  userId: string,
  seasonId: string,
  tier: number,
  track: 'free' | 'premium'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user progress
    const progress = await getUserSeasonProgress(userId, seasonId);
    if (!progress) {
      return { success: false, error: 'No progress found for this season' };
    }

    // Check if user has reached this tier
    if (progress.currentTier < tier) {
      return { success: false, error: `Tier ${tier} not reached yet` };
    }

    // Check if already claimed
    const claimedRewards = track === 'free' 
      ? (progress.claimedFreeRewards as number[] || [])
      : (progress.claimedPremiumRewards as number[] || []);

    if (claimedRewards.includes(tier)) {
      return { success: false, error: 'Reward already claimed' };
    }

    // Check premium requirement
    if (track === 'premium') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });

      if (!user?.isPremium) {
        return { success: false, error: 'Premium subscription required' };
      }
    }

    // Get tier and reward
    const seasonTier = await prisma.seasonTier.findFirst({
      where: {
        seasonId,
        tier,
      },
      include: {
        freeReward: true,
        premiumReward: true,
      },
    });

    if (!seasonTier) {
      return { success: false, error: 'Tier not found' };
    }

    const reward = track === 'free' 
      ? seasonTier.freeReward
      : seasonTier.premiumReward;

    if (!reward) {
      return { success: false, error: 'Reward not found' };
    }

    // Grant reward based on type
    await grantReward(userId, reward);

    // Update claimed rewards
    const updatedClaimed = [...claimedRewards, tier];
    await prisma.userSeasonProgress.update({
      where: { id: progress.id },
      data: track === 'free'
        ? { claimedFreeRewards: updatedClaimed }
        : { claimedPremiumRewards: updatedClaimed },
    });

    logger.info(`[Season] User ${userId} claimed ${track} reward for tier ${tier}`);

    return { success: true };
  } catch (error) {
    logger.error('[Season] Failed to claim reward', error);
    return { success: false, error: 'Failed to claim reward' };
  }
}

/**
 * Grant a season reward to user
 */
async function grantReward(userId: string, reward: any): Promise<void> {
  switch (reward.type) {
    case 'gold':
      await prisma.user.update({
        where: { id: userId },
        data: { funds: { increment: reward.amount || 0 } },
      });
      break;

    case 'diamonds':
      await prisma.user.update({
        where: { id: userId },
        data: { diamonds: { increment: reward.amount || 0 } },
      });
      break;

    case 'item':
      if (reward.itemId) {
        // Add item to inventory (v0.36.34 - Use UserItem)
        const { addItemToInventory } = await import('@/lib/services/itemService');
        await addItemToInventory(userId, reward.itemId, reward.quantity || 1);
      }
      break;

    case 'companion':
      if (reward.companionId) {
        // Grant companion
        await prisma.userCompanion.create({
          data: {
            userId,
            companionId: reward.companionId,
            equipped: false,
            level: 1,
            xp: 0,
          },
        });
      }
      break;

    case 'theme':
      // Themes are handled separately - just log for now
      logger.info(`[Season] Theme reward granted: ${reward.themeId}`);
      break;

    case 'xp-boost':
      // XP boosts are consumables - add to inventory as item
      logger.info(`[Season] XP boost granted: ${reward.amount} hours`);
      break;

    default:
      logger.warn(`[Season] Unknown reward type: ${reward.type}`);
  }
}

/**
 * Get full season progress for user
 */
export async function getSeasonProgress(userId: string): Promise<SeasonProgress | null> {
  const season = await getCurrentSeason();
  if (!season) {
    return null;
  }

  const progress = await getUserSeasonProgress(userId, season.id);
  if (!progress) {
    // Create initial progress
    const newProgress = await prisma.userSeasonProgress.create({
      data: {
        userId,
        seasonId: season.id,
        xp: 0,
        currentTier: 0,
        claimedFreeRewards: [],
        claimedPremiumRewards: [],
      },
    });

    return {
      season: {
        id: season.id,
        name: season.name,
        seasonNumber: season.seasonNumber,
        startsAt: season.startsAt,
        endsAt: season.endsAt,
        isActive: season.isActive,
      },
      tiers: season.tiers.map(t => ({
        id: t.id,
        tier: t.tier,
        xpRequired: t.xpRequired,
        freeReward: t.freeReward,
        premiumReward: t.premiumReward,
      })),
      userProgress: {
        xp: newProgress.xp,
        currentTier: newProgress.currentTier,
        claimedFreeRewards: (newProgress.claimedFreeRewards as number[]) || [],
        claimedPremiumRewards: (newProgress.claimedPremiumRewards as number[]) || [],
      },
    };
  }

  return {
    season: {
      id: season.id,
      name: season.name,
      seasonNumber: season.seasonNumber,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
      isActive: season.isActive,
    },
    tiers: season.tiers.map(t => ({
      id: t.id,
      tier: t.tier,
      xpRequired: t.xpRequired,
      freeReward: t.freeReward,
      premiumReward: t.premiumReward,
    })),
    userProgress: {
      xp: progress.xp,
      currentTier: progress.currentTier,
      claimedFreeRewards: (progress.claimedFreeRewards as number[]) || [],
      claimedPremiumRewards: (progress.claimedPremiumRewards as number[]) || [],
    },
  };
}

