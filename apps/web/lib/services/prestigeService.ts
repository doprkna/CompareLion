/**
 * Prestige Service
 * v0.29.10 - Badge & Title Rewards Integration
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Get badge key for prestige tier
 */
export function getPrestigeBadgeKey(prestigeCount: number): string {
  if (prestigeCount === 1) return 'prestige_first';
  if (prestigeCount === 5) return 'prestige_veteran';
  if (prestigeCount === 10) return 'prestige_master';
  if (prestigeCount === 25) return 'prestige_legend';
  if (prestigeCount === 50) return 'prestige_immortal';
  if (prestigeCount >= 100) return 'prestige_transcendent';
  
  // Default milestone badges (every 10 after 10)
  if (prestigeCount % 10 === 0) return 'prestige_milestone';
  
  // Every 5 prestiges
  if (prestigeCount % 5 === 0) return 'prestige_aspirant';
  
  // Every prestige
  return 'prestige_basic';
}

/**
 * Get title for prestige tier
 * v0.29.14 - Updated titles
 */
export function getPrestigeTitle(prestigeCount: number): string | null {
  if (prestigeCount === 1) return 'Reborn Wanderer';
  if (prestigeCount === 5) return 'Eternal Thinker';
  if (prestigeCount >= 10) return 'Chrono-Lion';
  return null;
}

/**
 * Get color theme for prestige tier
 * v0.29.14 - Prestige System Expansion
 */
export function getPrestigeColorTheme(prestigeCount: number): string | null {
  if (prestigeCount === 1) return 'amber'; // Warm golden
  if (prestigeCount === 5) return 'emerald'; // Green wisdom
  if (prestigeCount >= 10) return 'purple'; // Royal purple
  if (prestigeCount >= 25) return 'rose'; // Pink royalty
  if (prestigeCount >= 50) return 'indigo'; // Deep indigo
  if (prestigeCount >= 100) return 'cyan'; // Celestial cyan
  return null;
}

/**
 * Grant prestige badge to user
 */
export async function grantPrestigeBadge(
  userId: string,
  prestigeCount: number
): Promise<{ badgeId: string | null; badgeKey: string }> {
  const badgeKey = getPrestigeBadgeKey(prestigeCount);
  
  try {
    // Find or create badge
    let badge = await prisma.badge.findUnique({
      where: { key: badgeKey },
    });

    if (!badge) {
      // Create badge if it doesn't exist
      const badgeConfig = getPrestigeBadgeConfig(badgeKey, prestigeCount);
      badge = await prisma.badge.create({
        data: {
          key: badgeKey,
          name: badgeConfig.name,
          description: badgeConfig.description,
          icon: badgeConfig.icon,
          rarity: badgeConfig.rarity,
          unlockType: 'special',
          rewardType: badgeConfig.rewardType || null,
          rewardValue: badgeConfig.rewardValue || null,
          isActive: true,
          slug: badgeKey, // Legacy compatibility
        },
      });
    }

    // Check if user already has this badge
    const existing = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.id,
        },
      },
    });

    if (existing) {
      return { badgeId: badge.id, badgeKey };
    }

    // Grant badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
        unlockedAt: new Date(),
        isClaimed: false,
      },
    });

    // Send notification
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: '🏆 Prestige Badge Earned!',
          message: `You earned the "${badge.name}" badge!`,
          type: 'success',
          read: false,
        },
      });
    } catch (error) {
      logger.error('[PRESTIGE_SERVICE] Failed to create notification', error);
    }

    return { badgeId: badge.id, badgeKey };
  } catch (error) {
    logger.error('[PRESTIGE_SERVICE] Error granting badge', { badgeKey, error });
    return { badgeId: null, badgeKey };
  }
}

/**
 * Get badge configuration for prestige badges
 */
function getPrestigeBadgeConfig(badgeKey: string, prestigeCount: number) {
  const configs: Record<string, {
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    rewardType?: 'currency' | 'item' | 'title';
    rewardValue?: string;
  }> = {
    prestige_first: {
      name: 'First Prestige',
      description: 'You have completed your first prestige!',
      icon: '🏆',
      rarity: 'rare',
      rewardType: 'title',
      rewardValue: 'The Ascendant',
    },
    prestige_veteran: {
      name: 'Prestige Veteran',
      description: 'Completed 5 prestiges!',
      icon: '⭐',
      rarity: 'epic',
      rewardType: 'currency',
      rewardValue: '50', // Diamonds
    },
    prestige_master: {
      name: 'Prestige Master',
      description: 'Completed 10 prestiges!',
      icon: '👑',
      rarity: 'legendary',
      rewardType: 'title',
      rewardValue: 'The Master',
    },
    prestige_legend: {
      name: 'Prestige Legend',
      description: 'Completed 25 prestiges!',
      icon: '🔥',
      rarity: 'legendary',
      rewardType: 'currency',
      rewardValue: '250', // Diamonds
    },
    prestige_immortal: {
      name: 'Prestige Immortal',
      description: 'Completed 50 prestiges!',
      icon: '💀',
      rarity: 'mythic',
      rewardType: 'title',
      rewardValue: 'The Immortal',
    },
    prestige_transcendent: {
      name: 'Prestige Transcendent',
      description: 'Completed 100+ prestiges!',
      icon: '✨',
      rarity: 'mythic',
      rewardType: 'title',
      rewardValue: 'The Transcendent',
    },
    prestige_milestone: {
      name: `Prestige Milestone ${prestigeCount}`,
      description: `Completed ${prestigeCount} prestiges!`,
      icon: '🎯',
      rarity: 'epic',
      rewardType: 'currency',
      rewardValue: (prestigeCount * 5).toString(), // Scale with prestige count
    },
    prestige_aspirant: {
      name: `Prestige Aspirant ${prestigeCount}`,
      description: `Completed ${prestigeCount} prestiges!`,
      icon: '🌟',
      rarity: 'rare',
    },
    prestige_basic: {
      name: `Prestige ${prestigeCount}`,
      description: `Completed ${prestigeCount} prestiges!`,
      icon: '🏅',
      rarity: 'common',
    },
  };

  return configs[badgeKey] || configs.prestige_basic;
}

