/**
 * Badge Seeding Script
 * Creates base badges in the database
 * v0.36.24 - Social Profiles 2.0
 * 
 * Run: npx tsx apps/web/lib/seed-badges.ts
 */

import { prisma } from './db';

const BADGES = [
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

export async function seedBadges() {
  console.log('🌱 Seeding badges...');

  let created = 0;
  let skipped = 0;

  for (const badge of BADGES) {
    try {
      // Check if exists by key
      const existing = await prisma.badge.findUnique({
        where: { key: badge.key },
      });

      if (existing) {
        console.log(`⏭️  Skipping ${badge.key} (already exists)`);
        skipped++;
        continue;
      }

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

      console.log(`✅ Created: ${badge.name} (${badge.rarity})`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating ${badge.key}:`, error);
    }
  }

  console.log(`✨ Badge seeding complete! (${created} created, ${skipped} skipped)`);
  return { created, skipped };
}

