/**
 * BattlePass Service
 * v0.36.28 - BattlePass 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createNotification } from './notificationService';

export interface BattlePassTier {
  level: number;
  freeRewardId?: string;
  premiumRewardId?: string;
  premium: boolean;
}

export interface BattlePassProgress {
  season: {
    id: string;
    name: string;
    seasonNumber: number;
    startsAt: Date;
    endsAt: Date;
    premiumPrice: number | null;
  };
  tiers: BattlePassTier[];
  userProgress: {
    xp: number;
    currentTier: number;
    premiumActive: boolean;
    claimedTiers: number[];
    unlockedTiers: number[];
  };
}

/**
 * Calculate XP required for a tier
 * Formula: tierXP = 100 * tierNumber
 */
export function getTierXP(tier: number): number {
  return 100 * tier;
}

/**
 * Get current active battlepass season
 */
export async function getCurrentBattlePassSeason() {
  const now = new Date();
  return await prisma.battlePassSeason.findFirst({
    where: {
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { seasonNumber: 'desc' },
  });
}

/**
 * Get or create user battlepass progress
 */
export async function getUserBattlePassProgress(
  userId: string,
  seasonId: string
) {
  let progress = await prisma.userBattlePass.findUnique({
    where: {
      userId_seasonId: {
        userId,
        seasonId,
      },
    },
  });

  if (!progress) {
    progress = await prisma.userBattlePass.create({
      data: {
        userId,
        seasonId,
        xp: 0,
        premiumActive: false,
        claimedTiers: [],
      },
    });
  }

  return progress;
}

/**
 * Get full battlepass progress for user
 */
export async function getBattlePassProgress(
  userId: string
): Promise<BattlePassProgress | null> {
  const season = await getCurrentBattlePassSeason();
  if (!season) {
    return null;
  }

  const progress = await getUserBattlePassProgress(userId, season.id);
  const tiers = (season.tiers as BattlePassTier[]) || [];
  const claimedTiers = (progress.claimedTiers as number[]) || [];

  // Calculate unlocked tiers based on XP
  const unlockedTiers: number[] = [];
  for (const tier of tiers) {
    const tierXP = getTierXP(tier.level);
    if (progress.xp >= tierXP) {
      unlockedTiers.push(tier.level);
    }
  }

  return {
    season: {
      id: season.id,
      name: season.name,
      seasonNumber: season.seasonNumber,
      startsAt: season.startsAt,
      endsAt: season.endsAt,
      premiumPrice: season.premiumPrice,
    },
    tiers,
    userProgress: {
      xp: progress.xp,
      currentTier: unlockedTiers.length > 0 ? Math.max(...unlockedTiers) : 0,
      premiumActive: progress.premiumActive,
      claimedTiers,
      unlockedTiers,
    },
  };
}

/**
 * Add XP to battlepass
 * Returns updated level and any newly unlocked tiers
 */
export async function addBattlePassXP(
  userId: string,
  xpAmount: number
): Promise<{
  success: boolean;
  newTier?: number;
  unlockedTiers: number[];
  error?: string;
}> {
  try {
    const season = await getCurrentBattlePassSeason();
    if (!season) {
      return { success: false, unlockedTiers: [], error: 'No active season' };
    }

    const progress = await getUserBattlePassProgress(userId, season.id);
    const tiers = (season.tiers as BattlePassTier[]) || [];
    const claimedTiers = (progress.claimedTiers as number[]) || [];

    // Calculate old unlocked tiers
    const oldUnlockedTiers: number[] = [];
    for (const tier of tiers) {
      const tierXP = getTierXP(tier.level);
      if (progress.xp >= tierXP) {
        oldUnlockedTiers.push(tier.level);
      }
    }

    // Add XP
    const newXP = progress.xp + xpAmount;

    // Calculate new unlocked tiers
    const newUnlockedTiers: number[] = [];
    for (const tier of tiers) {
      const tierXP = getTierXP(tier.level);
      if (newXP >= tierXP && !oldUnlockedTiers.includes(tier.level)) {
        newUnlockedTiers.push(tier.level);
      }
    }

    // Update progress
    await prisma.userBattlePass.update({
      where: { id: progress.id },
      data: { xp: newXP },
    });

    // Send notifications for newly unlocked tiers
    if (newUnlockedTiers.length > 0) {
      const maxTier = Math.max(...newUnlockedTiers);
      await createNotification({
        userId,
        type: 'fight',
        title: `Tier ${maxTier} Unlocked! ⭐`,
        body: `You've unlocked tier ${maxTier} in the BattlePass`,
        refId: season.id,
      });
    }

    return {
      success: true,
      newTier: newUnlockedTiers.length > 0 ? Math.max(...newUnlockedTiers) : undefined,
      unlockedTiers: newUnlockedTiers,
    };
  } catch (error) {
    logger.error('[BattlePass] Failed to add XP', error);
    return { success: false, unlockedTiers: [], error: 'Failed to add XP' };
  }
}

/**
 * Claim a tier reward
 */
export async function claimBattlePassReward(
  userId: string,
  tier: number,
  track: 'free' | 'premium'
): Promise<{ success: boolean; error?: string }> {
  try {
    const season = await getCurrentBattlePassSeason();
    if (!season) {
      return { success: false, error: 'No active season' };
    }

    const progress = await getUserBattlePassProgress(userId, season.id);
    const tiers = (season.tiers as BattlePassTier[]) || [];
    const claimedTiers = (progress.claimedTiers as number[]) || [];

    // Check if tier exists
    const tierData = tiers.find(t => t.level === tier);
    if (!tierData) {
      return { success: false, error: 'Tier not found' };
    }

    // Check if tier is unlocked
    const tierXP = getTierXP(tier);
    if (progress.xp < tierXP) {
      return { success: false, error: `Tier ${tier} not unlocked yet` };
    }

    // Check if already claimed
    if (claimedTiers.includes(tier)) {
      return { success: false, error: 'Reward already claimed' };
    }

    // Check premium requirement
    if (track === 'premium' && !progress.premiumActive) {
      return { success: false, error: 'Premium battlepass required' };
    }

    // Get reward ID
    const rewardId = track === 'free' ? tierData.freeRewardId : tierData.premiumRewardId;
    if (!rewardId) {
      return { success: false, error: 'Reward not found' };
    }

    // Grant reward (simplified - will integrate with reward system)
    await grantBattlePassReward(userId, rewardId);

    // Update claimed tiers
    const updatedClaimed = [...claimedTiers, tier];
    await prisma.userBattlePass.update({
      where: { id: progress.id },
      data: { claimedTiers: updatedClaimed },
    });

    // Send notification
    await createNotification({
      userId,
      type: 'loot',
      title: `Reward Claimed! 🎁`,
      body: `You claimed tier ${tier} ${track} reward`,
      refId: season.id,
    });

    logger.info(`[BattlePass] User ${userId} claimed ${track} reward for tier ${tier}`);

    return { success: true };
  } catch (error) {
    logger.error('[BattlePass] Failed to claim reward', error);
    return { success: false, error: 'Failed to claim reward' };
  }
}

/**
 * Activate premium battlepass
 */
export async function activatePremiumBattlePass(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const season = await getCurrentBattlePassSeason();
    if (!season) {
      return { success: false, error: 'No active season' };
    }

    const progress = await getUserBattlePassProgress(userId, season.id);

    if (progress.premiumActive) {
      return { success: false, error: 'Premium already active' };
    }

    await prisma.userBattlePass.update({
      where: { id: progress.id },
      data: { premiumActive: true },
    });

    // Send notification
    await createNotification({
      userId,
      type: 'system',
      title: `Premium Activated! ⭐`,
      body: `You've activated premium battlepass for ${season.name}`,
      refId: season.id,
    });

    return { success: true };
  } catch (error) {
    logger.error('[BattlePass] Failed to activate premium', error);
    return { success: false, error: 'Failed to activate premium' };
  }
}

/**
 * Grant battlepass reward (simplified - integrate with reward system later)
 */
async function grantBattlePassReward(userId: string, rewardId: string): Promise<void> {
  // Parse reward ID format: type_id_amount
  // Examples: gold_100, item_key_1, diamond_50
  const parts = rewardId.split('_');
  const type = parts[0];
  const id = parts[1];
  const amount = parseInt(parts[2] || '1', 10);

  switch (type) {
    case 'gold':
      await prisma.user.update({
        where: { id: userId },
        data: { funds: { increment: amount } },
      });
      break;

    case 'diamond':
      // Assuming diamonds field exists
      await prisma.user.update({
        where: { id: userId },
        data: { diamonds: { increment: amount } },
      });
      break;

    case 'item':
      // Add item to inventory
      const existing = await prisma.inventoryItem.findFirst({
        where: {
          userId,
          itemKey: id,
        },
      });

      if (existing) {
        await prisma.inventoryItem.update({
          where: { id: existing.id },
          data: { power: (existing.power || 0) + amount },
        });
      } else {
        await prisma.inventoryItem.create({
          data: {
            userId,
            itemKey: id,
            power: amount,
            equipped: false,
          },
        });
      }
      break;

    default:
      logger.warn(`[BattlePass] Unknown reward type: ${type}`);
  }
}

/**
 * Claim all available rewards
 */
export async function claimAllAvailableRewards(
  userId: string
): Promise<{ success: boolean; claimed: number; errors: string[] }> {
  try {
    const progress = await getBattlePassProgress(userId);
    if (!progress) {
      return { success: false, claimed: 0, errors: ['No active season'] };
    }

    const { userProgress, tiers } = progress;
    const errors: string[] = [];
    let claimed = 0;

    // Claim all unlocked but unclaimed tiers
    for (const tierLevel of userProgress.unlockedTiers) {
      if (!userProgress.claimedTiers.includes(tierLevel)) {
        const tierData = tiers.find(t => t.level === tierLevel);
        if (tierData) {
          // Try free reward first
          if (tierData.freeRewardId) {
            const result = await claimBattlePassReward(userId, tierLevel, 'free');
            if (result.success) {
              claimed++;
            } else {
              errors.push(`Tier ${tierLevel} free: ${result.error}`);
            }
          }

          // Try premium reward if active
          if (userProgress.premiumActive && tierData.premiumRewardId) {
            const result = await claimBattlePassReward(userId, tierLevel, 'premium');
            if (result.success) {
              claimed++;
            } else {
              errors.push(`Tier ${tierLevel} premium: ${result.error}`);
            }
          }
        }
      }
    }

    return { success: true, claimed, errors };
  } catch (error) {
    logger.error('[BattlePass] Failed to claim all rewards', error);
    return { success: false, claimed: 0, errors: ['Failed to claim rewards'] };
  }
}

