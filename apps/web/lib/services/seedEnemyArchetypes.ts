/**
 * Seed Enemy Archetypes
 * Creates base enemy archetypes for procedural generation
 * v0.36.12 - Hybrid Enemy System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const ARCHETYPES = [
  {
    code: 'SLIME',
    name: 'Slime',
    baseHp: 30,
    baseAtk: 5,
    baseDef: 2,
    baseCrit: 0,
    baseSpeed: 1,
  },
  {
    code: 'GOBLIN',
    name: 'Goblin',
    baseHp: 40,
    baseAtk: 7,
    baseDef: 3,
    baseCrit: 3,
    baseSpeed: 5,
  },
  {
    code: 'WOLF',
    name: 'Wolf',
    baseHp: 45,
    baseAtk: 9,
    baseDef: 4,
    baseCrit: 5,
    baseSpeed: 7,
  },
  {
    code: 'SKELETON',
    name: 'Skeleton',
    baseHp: 50,
    baseAtk: 10,
    baseDef: 6,
    baseCrit: 2,
    baseSpeed: 3,
  },
  {
    code: 'BANDIT',
    name: 'Bandit',
    baseHp: 60,
    baseAtk: 12,
    baseDef: 6,
    baseCrit: 5,
    baseSpeed: 4,
  },
  {
    code: 'KNIGHT',
    name: 'Knight',
    baseHp: 80,
    baseAtk: 14,
    baseDef: 12,
    baseCrit: 5,
    baseSpeed: 2,
  },
  {
    code: 'MAGE',
    name: 'Mage',
    baseHp: 35,
    baseAtk: 16,
    baseDef: 3,
    baseCrit: 10,
    baseSpeed: 4,
  },
  {
    code: 'GOLEM',
    name: 'Golem',
    baseHp: 120,
    baseAtk: 10,
    baseDef: 18,
    baseCrit: 0,
    baseSpeed: 1,
  },
];

/**
 * Seed enemy archetypes
 */
export async function seedEnemyArchetypes(): Promise<number> {
  let count = 0;

  try {
    for (const archetype of ARCHETYPES) {
      const existing = await prisma.enemyArchetype.findUnique({
        where: { code: archetype.code },
      });

      if (!existing) {
        await prisma.enemyArchetype.create({
          data: archetype,
        });
        count++;
      } else {
        // Update existing archetype to ensure fields are current
        await prisma.enemyArchetype.update({
          where: { code: archetype.code },
          data: {
            name: archetype.name,
            baseHp: archetype.baseHp,
            baseAtk: archetype.baseAtk,
            baseDef: archetype.baseDef,
            baseCrit: archetype.baseCrit,
            baseSpeed: archetype.baseSpeed,
          },
        });
      }
    }

    logger.info(`[SeedEnemyArchetypes] Seeded ${count} new archetypes`);
    return count;
  } catch (error) {
    logger.error('[SeedEnemyArchetypes] Failed to seed archetypes', error);
    throw error;
  }
}

