/**
 * Battlepass Engine
 * XP calculation, level progression, unlock logic
 * v0.36.38 - Seasons & Battlepass 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  BattlepassTier,
  UserBattlepassProgress,
  BattlepassProgress,
  calculateLevelFromXP,
  calculateProgressToNextLevel,
  BattlepassTrack,
} from './types';
import { getCurrentSeason } from './seasonEngine';

/**
 * Get or create user battlepass progress
 */
export async function getUserBattlepassProgress(
  userId: string,
  seasonId: string
): Promise<UserBattlepassProgress | null> {
  try {
    // Try userBattlePass model first (newer system)
    let progress = await prisma.userBattlePass.findUnique({
      where: {
        userId_seasonId: {
          userId,
          seasonId,
        },
      },
    });

    if (progress) {
      // Calculate unlocked levels based on XP
      const tiers = await getBattlepassTiers(seasonId);
      const unlockedLevels = calculateUnlockedLevels(progress.xp, tiers);

      return {
        id: progress.id,
        userId: progress.userId,
        seasonId: progress.seasonId,
        xp: progress.xp,
        currentLevel: calculateLevelFromXP(progress.xp),
        premiumActive: progress.premiumActive,
        claimedRewards: (progress.claimedTiers as number[]) || [],
        unlockedLevels,
      };
    }

    // Fallback to userSeasonProgress model (older system)
    const seasonProgress = await prisma.userSeasonProgress.findUnique({
      where: {
        userId_seasonId: {
          userId,
          seasonId,
        },
      },
    });

    if (seasonProgress) {
      const tiers = await getBattlepassTiers(seasonId);
      const unlockedLevels = calculateUnlockedLevels(seasonProgress.xp, tiers);

      return {
        id: seasonProgress.id,
        userId: seasonProgress.userId,
        seasonId: seasonProgress.seasonId,
        xp: seasonProgress.xp,
        currentLevel: seasonProgress.currentTier || 0,
        premiumActive: false, // Check user.isPremium if needed
        claimedRewards: [
          ...((seasonProgress.claimedFreeRewards as number[]) || []),
          ...((seasonProgress.claimedPremiumRewards as number[]) || []),
        ],
        unlockedLevels,
      };
    }

    // Create new progress
    return await createBattlepassProgress(userId, seasonId);
  } catch (error) {
    logger.error('[BattlepassEngine] Failed to get user progress', { userId, seasonId, error });
    return null;
  }
}

/**
 * Create new battlepass progress for user
 */
async function createBattlepassProgress(
  userId: string,
  seasonId: string
): Promise<UserBattlepassProgress> {
  try {
    // Try userBattlePass model first
    const progress = await prisma.userBattlePass.create({
      data: {
        userId,
        seasonId,
        xp: 0,
        premiumActive: false,
        claimedTiers: [],
      },
    });

    return {
      id: progress.id,
      userId: progress.userId,
      seasonId: progress.seasonId,
      xp: progress.xp,
      currentLevel: 0,
      premiumActive: progress.premiumActive,
      claimedRewards: [],
      unlockedLevels: [],
    };
  } catch (error) {
    // Fallback to userSeasonProgress model
    const progress = await prisma.userSeasonProgress.create({
      data: {
        userId,
        seasonId,
        xp: 0,
        currentTier: 0,
        claimedFreeRewards: [],
        claimedPremiumRewards: [],
      },
    });

    return {
      id: progress.id,
      userId: progress.userId,
      seasonId: progress.seasonId,
      xp: progress.xp,
      currentLevel: 0,
      premiumActive: false,
      claimedRewards: [],
      unlockedLevels: [],
    };
  }
}

/**
 * Add XP to user's battlepass
 * Returns updated level and newly unlocked tiers
 */
export async function addBattlepassXP(
  userId: string,
  xpAmount: number
): Promise<{ success: boolean; newLevel?: number; unlockedLevels: number[]; error?: string }> {
  try {
    const season = await getCurrentSeason();
    if (!season) {
      return { success: false, unlockedLevels: [], error: 'No active season' };
    }

    const progress = await getUserBattlepassProgress(userId, season.id);
    if (!progress) {
      return { success: false, unlockedLevels: [], error: 'Failed to get progress' };
    }

    const tiers = await getBattlepassTiers(season.id);
    const oldUnlockedLevels = progress.unlockedLevels;
    const oldLevel = progress.currentLevel;

    // Add XP
    const newXP = progress.xp + xpAmount;
    const newLevel = calculateLevelFromXP(newXP);
    const newUnlockedLevels = calculateUnlockedLevels(newXP, tiers);

    // Find newly unlocked levels
    const newlyUnlocked = newUnlockedLevels.filter(level => !oldUnlockedLevels.includes(level));

    // Update progress
    try {
      await prisma.userBattlePass.update({
        where: { id: progress.id },
        data: { xp: newXP },
      });
    } catch (error) {
      // Fallback to userSeasonProgress
      await prisma.userSeasonProgress.update({
        where: { id: progress.id },
        data: {
          xp: newXP,
          currentTier: newLevel,
        },
      });
    }

    logger.info(`[BattlepassEngine] Added ${xpAmount} XP to user ${userId}, new level: ${newLevel}`);

    return {
      success: true,
      newLevel: newLevel > oldLevel ? newLevel : undefined,
      unlockedLevels: newlyUnlocked,
    };
  } catch (error) {
    logger.error('[BattlepassEngine] Failed to add XP', { userId, xpAmount, error });
    return { success: false, unlockedLevels: [], error: 'Failed to add XP' };
  }
}

/**
 * Check if user can claim a tier reward
 */
export async function canClaimReward(
  userId: string,
  seasonId: string,
  tier: number,
  track: BattlepassTrack
): Promise<{ canClaim: boolean; error?: string }> {
  try {
    const progress = await getUserBattlepassProgress(userId, seasonId);
    if (!progress) {
      return { canClaim: false, error: 'No progress found' };
    }

    // Check if tier is unlocked
    if (!progress.unlockedLevels.includes(tier)) {
      return { canClaim: false, error: `Tier ${tier} not unlocked yet` };
    }

    // Check if already claimed
    if (progress.claimedRewards.includes(tier)) {
      return { canClaim: false, error: 'Reward already claimed' };
    }

    // Check premium requirement
    if (track === BattlepassTrack.PREMIUM && !progress.premiumActive) {
      return { canClaim: false, error: 'Premium battlepass required' };
    }

    return { canClaim: true };
  } catch (error) {
    logger.error('[BattlepassEngine] Failed to check claim eligibility', { userId, seasonId, tier, error });
    return { canClaim: false, error: 'Failed to check eligibility' };
  }
}

/**
 * Get battlepass tiers for a season
 */
async function getBattlepassTiers(seasonId: string): Promise<BattlepassTier[]> {
  try {
    // Try battlePassSeason model first
    const battlePassSeason = await prisma.battlePassSeason.findUnique({
      where: { id: seasonId },
    });

    if (battlePassSeason && battlePassSeason.tiers) {
      const tiers = battlePassSeason.tiers as any[];
      return tiers.map((t: any) => ({
        level: t.level,
        xpRequired: calculateLevelXP(t.level),
        freeReward: t.freeRewardId ? { type: 'gold' as const, amount: 0 } : null,
        premiumReward: t.premiumRewardId ? { type: 'gold' as const, amount: 0 } : null,
      }));
    }

    // Fallback to seasonTier model
    const seasonTiers = await prisma.seasonTier.findMany({
      where: { seasonId },
      orderBy: { tier: 'asc' },
    });

    return seasonTiers.map(t => ({
      level: t.tier,
      xpRequired: t.xpRequired,
      freeReward: null,
      premiumReward: null,
    }));
  } catch (error) {
    logger.error('[BattlepassEngine] Failed to get tiers', { seasonId, error });
    return [];
  }
}

/**
 * Calculate unlocked levels based on XP and tiers
 */
function calculateUnlockedLevels(xp: number, tiers: BattlepassTier[]): number[] {
  const unlocked: number[] = [];
  for (const tier of tiers) {
    if (xp >= tier.xpRequired) {
      unlocked.push(tier.level);
    }
  }
  return unlocked;
}

/**
 * Get full battlepass progress for user
 */
export async function getBattlepassProgress(userId: string): Promise<BattlepassProgress | null> {
  try {
    const season = await getCurrentSeason();
    if (!season) {
      return null;
    }

    const progress = await getUserBattlepassProgress(userId, season.id);
    if (!progress) {
      return null;
    }

    const tiers = await getBattlepassTiers(season.id);
    const progressToNext = calculateProgressToNextLevel(progress.xp);

    return {
      season,
      tiers,
      userProgress: {
        xp: progress.xp,
        currentLevel: progress.currentLevel,
        premiumActive: progress.premiumActive,
        claimedRewards: progress.claimedRewards,
        unlockedLevels: progress.unlockedLevels,
        progressToNextLevel: progressToNext,
      },
    };
  } catch (error) {
    logger.error('[BattlepassEngine] Failed to get battlepass progress', { userId, error });
    return null;
  }
}

