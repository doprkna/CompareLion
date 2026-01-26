/**
 * Achievement Service
 * Handles achievement unlocking, rewards, and queries
 * v0.26.0 - Achievements Awakened
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { RewardConfig } from '@parel/core/config/rewardConfig';
import { calculateAchievementReward } from '@/lib/services/rewardService';

export interface UnlockAchievementParams {
  userId: string;
  key: string;
  tier?: number;
}

export interface AchievementUnlockResult {
  unlocked: boolean;
  alreadyUnlocked: boolean;
  achievementId: string;
  xpReward: number;
  goldReward: number;
  tier: number;
}

/**
 * Unlock an achievement for a user (idempotent)
 * Awards XP and gold if newly unlocked
 */
export async function unlockAchievement(
  userId: string,
  key: string,
  tier: number = 1
): Promise<AchievementUnlockResult | null> {
  try {
    // Find achievement by key
    const achievement = await prisma.achievement.findUnique({
      where: { key },
    });

    if (!achievement) {
      logger.warn(`[AchievementService] Achievement not found: ${key}`);
      return null;
    }

    // Check if already unlocked at this tier
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId_tier: {
          userId,
          achievementId: achievement.id,
          tier,
        },
      },
    });

    if (existing) {
      return {
        unlocked: false,
        alreadyUnlocked: true,
        achievementId: achievement.id,
        xpReward: achievement.xpReward || 0,
        goldReward: achievement.rewardGold || 0,
        tier,
      };
    }

    // Create user achievement
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        tier,
        earnedAt: new Date(),
      },
    });

    // Award XP and gold (use DB values or fallback to RewardConfig defaults)
    const xpReward = achievement.xpReward || RewardConfig.achievement.xp;
    const goldReward = achievement.rewardGold || RewardConfig.achievement.gold;
    
    // Calculate final reward (no multipliers for achievements per requirements)
    const rewardResult = calculateAchievementReward(xpReward, goldReward);

    if (rewardResult.xp > 0 || rewardResult.gold > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: rewardResult.xp },
          funds: { increment: rewardResult.gold },
        },
      });
    }

    logger.info(`[AchievementService] Unlocked: ${key} (tier ${tier}) for user ${userId}`);

    // Create feed post for achievement unlock (v0.36.25)
    try {
      const { postAchievement } = await import('@/lib/services/feedService');
      await postAchievement(userId, achievement.id, achievement.title || achievement.name || key);
    } catch (error) {
      // Don't fail achievement unlock if feed post fails
      logger.debug('[AchievementService] Feed post failed', error);
    }

    // Create notification for achievement unlock (v0.36.26)
    try {
      const { notifyAchievementUnlocked } = await import('@/lib/services/notificationService');
      await notifyAchievementUnlocked(
        userId,
        achievement.title || achievement.name || key,
        achievement.id
      );
    } catch (error) {
      // Don't fail achievement unlock if notification fails
      logger.debug('[AchievementService] Notification failed', error);
    }

    return {
      unlocked: true,
      alreadyUnlocked: false,
      achievementId: achievement.id,
      xpReward: rewardResult.xp,
      goldReward: rewardResult.gold,
      tier,
    };
  } catch (error) {
    logger.error('[AchievementService] Error unlocking achievement', error);
    throw error;
  }
}

/**
 * Get all achievements with user unlock status
 */
export async function getUserAchievements(userId: string) {
  const achievements = await prisma.achievement.findMany({
    orderBy: [
      { category: 'asc' },
      { tier: 'asc' },
      { title: 'asc' },
    ],
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: {
      achievementId: true,
      tier: true,
      earnedAt: true,
    },
  });

  // Create map of unlocked achievements
  const unlockedMap = new Map<string, { tier: number; earnedAt: Date }>();
  userAchievements.forEach((ua) => {
    unlockedMap.set(ua.achievementId, { tier: ua.tier, earnedAt: ua.earnedAt });
  });

  return achievements.map((achievement) => {
    const unlocked = unlockedMap.get(achievement.id);
    return {
      ...achievement,
      unlocked: !!unlocked,
      unlockedTier: unlocked?.tier || null,
      unlockedAt: unlocked?.earnedAt || null,
    };
  });
}

/**
 * Get achievements grouped by category
 */
export async function getAchievementsByCategory(userId: string) {
  const achievements = await getUserAchievements(userId);

  const categories = achievements.reduce(
    (acc, achievement) => {
      const category = achievement.category || 'integration';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(achievement);
      return acc;
    },
    {} as Record<string, typeof achievements>
  );

  return categories;
}

