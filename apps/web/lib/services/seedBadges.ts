/**
 * Seed Core Badges
 * Creates default badges for the social profile system
 * v0.36.24 - Social Profiles 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const CORE_BADGES = [
  {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'One of the first 10 users',
    icon: '🌅',
    rarity: 'rare',
    unlockType: 'special',
    requirementValue: 'first_10_users',
  },
  {
    key: 'adventurer',
    name: 'Adventurer',
    description: 'Finished 10 questions',
    icon: '🗺️',
    rarity: 'common',
    unlockType: 'level',
    requirementValue: '10_questions',
  },
  {
    key: 'warrior',
    name: 'Warrior',
    description: 'Won 10 fights',
    icon: '⚔️',
    rarity: 'common',
    unlockType: 'level',
    requirementValue: '10_fights',
  },
  {
    key: 'collector',
    name: 'Collector',
    description: 'Owns 10 items',
    icon: '📦',
    rarity: 'common',
    unlockType: 'level',
    requirementValue: '10_items',
  },
  {
    key: 'cat_person',
    name: 'Cat Person',
    description: 'Equipped cat companion',
    icon: '🐱',
    rarity: 'uncommon',
    unlockType: 'special',
    requirementValue: 'cat_companion',
  },
  {
    key: 'premium',
    name: 'Premium',
    description: 'Active premium subscription',
    icon: '💎',
    rarity: 'rare',
    unlockType: 'special',
    requirementValue: 'premium_active',
  },
  {
    key: 'lucky',
    name: 'Lucky',
    description: 'Critical hit rate > 20%',
    icon: '🍀',
    rarity: 'uncommon',
    unlockType: 'special',
    requirementValue: 'crit_20',
  },
  {
    key: 'socializer',
    name: 'Socializer',
    description: 'Made 10 comparisons',
    icon: '👥',
    rarity: 'common',
    unlockType: 'level',
    requirementValue: '10_comparisons',
  },
  {
    key: 'season_1_veteran',
    name: 'Season 1 Veteran',
    description: 'Participated in Season 1',
    icon: '🏆',
    rarity: 'epic',
    unlockType: 'season',
    requirementValue: 'season_1',
  },
  {
    key: 'tester',
    name: 'Tester',
    description: 'Beta tester badge',
    icon: '🧪',
    rarity: 'rare',
    unlockType: 'special',
    requirementValue: 'beta_tester',
  },
];

/**
 * Seed core badges
 * Creates badges if they don't already exist
 */
export async function seedCoreBadges(): Promise<number> {
  let count = 0;

  try {
    for (const badge of CORE_BADGES) {
      const existing = await prisma.badge.findUnique({
        where: { key: badge.key },
      });

      if (!existing) {
        await prisma.badge.create({
          data: {
            key: badge.key,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            rarity: badge.rarity as any,
            unlockType: badge.unlockType as any,
            requirementValue: badge.requirementValue,
            isActive: true,
            slug: badge.key, // Legacy compatibility
          },
        });
        count++;
      }
    }

    logger.info(`[SeedBadges] Seeded ${count} core badges`);
    return count;
  } catch (error) {
    logger.error('[SeedBadges] Failed to seed badges', error);
    throw error;
  }
}

