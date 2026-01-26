/**
 * Achievement Checker Service
 * Checks and unlocks achievements based on context
 * v0.36.9 - Achievements & Milestone System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { unlockAchievement } from './achievementService';

export interface AchievementContext {
  fightsWon?: number;
  totalWins?: number;
  damageThisFight?: number;
  damageDealt?: number;
  heroHp?: number;
  heroHpRemaining?: number;
  heroMaxHp?: number;
  heroLevel?: number;
  gold?: number;
  totalGoldEarned?: number;
  questCompleted?: boolean;
  streak?: number;
  hasBoughtSomething?: boolean;
  enemyTier?: string;
  enemyVariant?: string;
}

/**
 * Check and unlock achievements based on context
 * Returns list of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(
  userId: string,
  context: AchievementContext
): Promise<string[]> {
  const unlocked: string[] = [];

  try {
    // Get user stats for counting
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        funds: true,
      },
    });

    if (!user) {
      return unlocked;
    }

    // Count total fight wins
    const totalWins = context.totalWins ?? await prisma.fight.count({
      where: {
        heroId: userId,
        winner: 'hero',
      },
    });

    // Count total gold earned (approximate from current funds + purchases)
    // For now, use current funds as proxy
    const totalGold = context.totalGoldEarned ?? user.funds ?? 0;

    // Get quest streak (if available)
    const questStreak = context.streak ?? 0;

    // Combat Achievements
    if (context.fightsWon !== undefined) {
      // FIRST_FIGHT - win 1 fight
      if (totalWins >= 1) {
        const result = await unlockAchievement(userId, 'FIRST_FIGHT');
        if (result?.unlocked) unlocked.push('FIRST_FIGHT');
      }

      // TEN_WINS - win 10 fights
      if (totalWins >= 10) {
        const result = await unlockAchievement(userId, 'TEN_WINS');
        if (result?.unlocked) unlocked.push('TEN_WINS');
      }

      // HUNDRED_WINS - win 100 fights
      if (totalWins >= 100) {
        const result = await unlockAchievement(userId, 'HUNDRED_WINS');
        if (result?.unlocked) unlocked.push('HUNDRED_WINS');
      }

      // GLASS_CANNON - win fight with <20% HP remaining
      if (context.heroHp !== undefined && context.heroMaxHp !== undefined) {
        const hpPercent = (context.heroHp / context.heroMaxHp) * 100;
        if (hpPercent < 20 && context.fightsWon > 0) {
          const result = await unlockAchievement(userId, 'GLASS_CANNON');
          if (result?.unlocked) unlocked.push('GLASS_CANNON');
        }
      }

      // OVERKILL - deal >50 damage in a single hit
      if (context.damageThisFight !== undefined && context.damageThisFight > 50) {
        const result = await unlockAchievement(userId, 'OVERKILL');
        if (result?.unlocked) unlocked.push('OVERKILL');
      }

      // HARD_WIN - defeat HARD tier enemy
      if (context.enemyTier === 'HARD') {
        const result = await unlockAchievement(userId, 'HARD_WIN');
        if (result?.unlocked) unlocked.push('HARD_WIN');
      }

      // ELITE_WIN - defeat ELITE tier enemy
      if (context.enemyTier === 'ELITE') {
        const result = await unlockAchievement(userId, 'ELITE_WIN');
        if (result?.unlocked) unlocked.push('ELITE_WIN');
      }

      // SLAYER - defeat 50 procedural enemies
      // Count procedural enemy wins (enemies with tier/variant)
      if (context.enemyTier) {
        const proceduralWins = await prisma.fight.count({
          where: {
            heroId: userId,
            winner: 'hero',
            // Note: We'd need to store enemy tier in Fight model for accurate tracking
            // For now, count all wins as potential procedural wins
          },
        });
        if (proceduralWins >= 50) {
          const result = await unlockAchievement(userId, 'SLAYER');
          if (result?.unlocked) unlocked.push('SLAYER');
        }
      }

      // ELEMENT_HUNTER - defeat one of each elemental variant
      if (context.enemyVariant) {
        const elementVariants = ['Fire', 'Ice', 'Shadow', 'Earth'];
        if (elementVariants.includes(context.enemyVariant)) {
          // Get user's defeated variants (stored in metadata or separate tracking)
          // For now, check if this variant was defeated
          // In a full implementation, we'd track this in User metadata or a separate table
          const result = await unlockAchievement(userId, 'ELEMENT_HUNTER');
          if (result?.unlocked) unlocked.push('ELEMENT_HUNTER');
        }
      }
    }

    // Progress Achievements
    if (context.heroLevel !== undefined) {
      // LEVEL_5 - reach level 5
      if (user.level >= 5) {
        const result = await unlockAchievement(userId, 'LEVEL_5');
        if (result?.unlocked) unlocked.push('LEVEL_5');
      }

      // LEVEL_10 - reach level 10
      if (user.level >= 10) {
        const result = await unlockAchievement(userId, 'LEVEL_10');
        if (result?.unlocked) unlocked.push('LEVEL_10');
      }
    }

    // Economy Achievements
    if (context.hasBoughtSomething) {
      // FIRST_PURCHASE - buy first item from marketplace
      const result = await unlockAchievement(userId, 'FIRST_PURCHASE');
      if (result?.unlocked) unlocked.push('FIRST_PURCHASE');
    }

    // THOUSAND_GOLD - reach 1000 total gold earned
    if (totalGold >= 1000) {
      const result = await unlockAchievement(userId, 'THOUSAND_GOLD');
      if (result?.unlocked) unlocked.push('THOUSAND_GOLD');
    }

    // Quest Achievements
    if (context.questCompleted) {
      // FIRST_QUEST - complete 1 daily quest
      const questCompletions = await prisma.questCompletion.count({
        where: {
          userId,
          completed: true,
        },
      });

      if (questCompletions >= 1) {
        const result = await unlockAchievement(userId, 'FIRST_QUEST');
        if (result?.unlocked) unlocked.push('FIRST_QUEST');
      }

      // QUEST_STREAK_3 - 3-day streak
      if (questStreak >= 3) {
        const result = await unlockAchievement(userId, 'QUEST_STREAK_3');
        if (result?.unlocked) unlocked.push('QUEST_STREAK_3');
      }

      // QUEST_STREAK_7 - 7-day streak
      if (questStreak >= 7) {
        const result = await unlockAchievement(userId, 'QUEST_STREAK_7');
        if (result?.unlocked) unlocked.push('QUEST_STREAK_7');
      }
    }

    if (unlocked.length > 0) {
      logger.info(`[AchievementChecker] Unlocked ${unlocked.length} achievements for user ${userId}`, {
        achievements: unlocked,
      });
    }

    return unlocked;
  } catch (error) {
    logger.error('[AchievementChecker] Error checking achievements', error);
    // Don't throw - achievements are non-critical
    return unlocked;
  }
}

