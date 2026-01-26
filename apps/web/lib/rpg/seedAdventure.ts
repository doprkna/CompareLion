/**
 * Seed Adventure Nodes
 * v0.36.16 - Adventure Mode v0.1
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const CHAPTER_1_NODES = [
  {
    stage: 1,
    type: 'fight',
    data: { tier: 'normal' },
  },
  {
    stage: 2,
    type: 'reward',
    data: { gold: 20 },
  },
  {
    stage: 3,
    type: 'fight',
    data: { tier: 'hard' },
  },
  {
    stage: 4,
    type: 'fight',
    data: { tier: 'normal' },
  },
  {
    stage: 5,
    type: 'shop',
    data: { potionsOnly: true },
  },
  {
    stage: 6,
    type: 'reward',
    data: { epicChance: true },
  },
  {
    stage: 7,
    type: 'fight',
    data: { tier: 'elite' },
  },
  {
    stage: 8,
    type: 'event',
    data: { code: 'fortune_day' },
  },
  {
    stage: 9,
    type: 'fight',
    data: { tier: 'hard' },
  },
  {
    stage: 10,
    type: 'fight',
    data: { tier: 'elite', boss: true },
  },
];

/**
 * Seed Chapter 1 nodes
 */
export async function seedAdventureNodes(): Promise<number> {
  let count = 0;

  for (const nodeData of CHAPTER_1_NODES) {
    try {
      const existing = await prisma.adventureNode.findFirst({
        where: {
          stage: nodeData.stage,
        },
      });

      if (!existing) {
        await prisma.adventureNode.create({
          data: {
            stage: nodeData.stage,
            type: nodeData.type,
            data: nodeData.data,
          },
        });
        count++;
        logger.info(`[SeedAdventure] Created node stage ${nodeData.stage}`);
      } else {
        // Update existing node
        await prisma.adventureNode.update({
          where: { id: existing.id },
          data: {
            type: nodeData.type,
            data: nodeData.data,
          },
        });
      }
    } catch (error) {
      logger.error(`[SeedAdventure] Error seeding node stage ${nodeData.stage}`, error);
    }
  }

  return count;
}

