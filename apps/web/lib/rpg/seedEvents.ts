/**
 * Seed RPG Events
 * v0.36.15 - Event System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const CORE_EVENTS = [
  {
    code: 'blood_moon',
    name: 'Blood Moon',
    description: 'ATK +20%, CRIT +10%',
    effect: {
      atkMultiplier: 1.2,
      critBonus: 10,
    },
  },
  {
    code: 'shield_week',
    name: 'Shield Week',
    description: 'DEF +25%',
    effect: {
      defMultiplier: 1.25,
    },
  },
  {
    code: 'fortune_day',
    name: 'Fortune Day',
    description: 'Gold +20%',
    effect: {
      goldBonus: 0.2,
    },
  },
  {
    code: 'xp_surge',
    name: 'XP Surge',
    description: 'XP +30%',
    effect: {
      xpBonus: 0.3,
    },
  },
  {
    code: 'swift_winds',
    name: 'Swift Winds',
    description: 'Speed +15%',
    effect: {
      speedBonus: 15,
    },
  },
  {
    code: 'monster_frenzy',
    name: 'Monster Frenzy',
    description: 'Enemies: ATK +10%, HP +10%',
    effect: {
      enemyAtkMultiplier: 1.1,
      enemyHpMultiplier: 1.1,
    },
  },
];

/**
 * Seed core events into database
 * Uses upsert to avoid duplicates
 */
export async function seedEvents(): Promise<number> {
  let count = 0;
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  for (const eventData of CORE_EVENTS) {
    try {
      const existing = await prisma.rpgEvent.findUnique({
        where: { code: eventData.code },
      });

      if (!existing) {
        await prisma.rpgEvent.create({
          data: {
            code: eventData.code,
            name: eventData.name,
            description: eventData.description,
            effect: eventData.effect,
            startsAt: now,
            endsAt: oneWeekFromNow,
            active: false, // Inactive by default - admin activates
          },
        });
        count++;
        logger.info(`[SeedEvents] Created event: ${eventData.code}`);
      } else {
        // Update existing event to ensure correct effect
        await prisma.rpgEvent.update({
          where: { code: eventData.code },
          data: {
            effect: eventData.effect,
            description: eventData.description,
          },
        });
      }
    } catch (error) {
      logger.error(`[SeedEvents] Error seeding event ${eventData.code}`, error);
    }
  }

  return count;
}

