/**
 * Economy Modifiers Seed Helper
 * v0.34.2 - Seeds default economy gamification modifiers
 */

import { prisma } from '@/lib/db';

export interface EconomyModifier {
  key: string;
  value: number;
  description: string;
}

export const DEFAULT_MODIFIERS: EconomyModifier[] = [
  {
    key: 'streak_xp_bonus',
    value: 0.05, // +5% XP per day of active streak
    description: 'XP bonus multiplier per active streak day (0.05 = 5% per day)',
  },
  {
    key: 'social_xp_multiplier',
    value: 1.1, // +10% XP on social actions
    description: 'Multiplier for XP earned from social actions (comments, reactions, etc.)',
  },
  {
    key: 'weekly_modifier_value',
    value: 0.1, // +10% for active weekly modifier
    description: 'Percentage bonus for active weekly modifier (0.1 = 10%)',
  },
];

/**
 * Seeds default economy modifiers
 * Safe to call multiple times - uses upsert
 */
export async function seedEconomyModifiers(): Promise<void> {
  console.log('🌱 Seeding economy modifiers...');

  for (const modifier of DEFAULT_MODIFIERS) {
    await prisma.balanceSetting.upsert({
      where: { key: modifier.key },
      update: {
        // Only update value if it doesn't exist (keep manual changes)
        updatedAt: new Date(),
      },
      create: {
        key: modifier.key,
        value: modifier.value,
      },
    });

    console.log(`  ✅ ${modifier.key}: ${modifier.value}`);
  }

  console.log('🌱 Economy modifiers seeded successfully');
}

/**
 * Get all economy modifiers
 */
export async function getEconomyModifiers(): Promise<Record<string, number>> {
  const settings = await prisma.balanceSetting.findMany({
    where: {
      key: {
        in: DEFAULT_MODIFIERS.map((m) => m.key),
      },
    },
  });

  const modifiers: Record<string, number> = {};
  for (const setting of settings) {
    modifiers[setting.key] = setting.value;
  }

  // Fill in defaults for missing keys
  for (const defaultMod of DEFAULT_MODIFIERS) {
    if (!(defaultMod.key in modifiers)) {
      modifiers[defaultMod.key] = defaultMod.value;
    }
  }

  return modifiers;
}

