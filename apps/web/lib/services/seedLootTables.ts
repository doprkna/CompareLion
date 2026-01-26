/**
 * Seed Loot Tables
 * Creates default loot table entries for existing enemies
 * v0.36.7 - Rewards engine + loot tables
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Seed loot tables for existing enemies
 * Creates weighted loot entries based on enemy names
 */
export async function seedLootTables(): Promise<number> {
  let count = 0;

  try {
    // Get all enemies
    const enemies = await prisma.enemy.findMany({
      select: { id: true, name: true },
    });

    for (const enemy of enemies) {
      const enemyName = enemy.name.toLowerCase();

      // Skip if loot tables already exist for this enemy
      const existing = await prisma.lootTable.findFirst({
        where: { enemyId: enemy.id },
      });

      if (existing) {
        continue; // Already seeded
      }

      // Seed based on enemy name patterns
      if (enemyName.includes('slime')) {
        // Slime → 80% no item, 20% random potion
        await prisma.lootTable.createMany({
          data: [
            {
              enemyId: enemy.id,
              itemId: null,
              weight: 800, // 80%
              minGold: 5,
              maxGold: 15,
              minXp: 10,
              maxXp: 20,
            },
            {
              enemyId: enemy.id,
              itemId: 'potion', // Will be handled as string key
              weight: 200, // 20%
              minGold: 0,
              maxGold: 5,
              minXp: 15,
              maxXp: 25,
            },
          ],
        });
        count += 2;
      } else if (enemyName.includes('wolf')) {
        // Wolf → 70% gold, 30% fang item
        await prisma.lootTable.createMany({
          data: [
            {
              enemyId: enemy.id,
              itemId: null,
              weight: 700, // 70%
              minGold: 10,
              maxGold: 25,
              minXp: 15,
              maxXp: 30,
            },
            {
              enemyId: enemy.id,
              itemId: 'fang',
              weight: 300, // 30%
              minGold: 5,
              maxGold: 15,
              minXp: 20,
              maxXp: 35,
            },
          ],
        });
        count += 2;
      } else if (enemyName.includes('bandit')) {
        // Bandit → 60% gold, 40% dagger
        await prisma.lootTable.createMany({
          data: [
            {
              enemyId: enemy.id,
              itemId: null,
              weight: 600, // 60%
              minGold: 15,
              maxGold: 35,
              minXp: 20,
              maxXp: 40,
            },
            {
              enemyId: enemy.id,
              itemId: 'dagger',
              weight: 400, // 40%
              minGold: 10,
              maxGold: 20,
              minXp: 25,
              maxXp: 45,
            },
          ],
        });
        count += 2;
      } else if (enemyName.includes('skeleton')) {
        // Skeleton → 50% bone, 50% nothing
        await prisma.lootTable.createMany({
          data: [
            {
              enemyId: enemy.id,
              itemId: 'bone',
              weight: 500, // 50%
              minGold: 8,
              maxGold: 18,
              minXp: 18,
              maxXp: 32,
            },
            {
              enemyId: enemy.id,
              itemId: null,
              weight: 500, // 50%
              minGold: 5,
              maxGold: 12,
              minXp: 15,
              maxXp: 28,
            },
          ],
        });
        count += 2;
      } else if (enemyName.includes('orc')) {
        // Orc → 50% gold, 30% axe, 20% armor shard
        await prisma.lootTable.createMany({
          data: [
            {
              enemyId: enemy.id,
              itemId: null,
              weight: 500, // 50%
              minGold: 20,
              maxGold: 45,
              minXp: 25,
              maxXp: 50,
            },
            {
              enemyId: enemy.id,
              itemId: 'axe',
              weight: 300, // 30%
              minGold: 15,
              maxGold: 30,
              minXp: 30,
              maxXp: 55,
            },
            {
              enemyId: enemy.id,
              itemId: 'armor-shard',
              weight: 200, // 20%
              minGold: 10,
              maxGold: 25,
              minXp: 35,
              maxXp: 60,
            },
          ],
        });
        count += 3;
      } else {
        // Default: 100% gold (fallback for other enemies)
        await prisma.lootTable.create({
          data: {
            enemyId: enemy.id,
            itemId: null,
            weight: 1000, // 100%
            minGold: 10,
            maxGold: 20,
            minXp: 15,
            maxXp: 30,
          },
        });
        count += 1;
      }
    }

    logger.info(`[SeedLootTables] Seeded ${count} loot table entries`);
    return count;
  } catch (error) {
    logger.error('[SeedLootTables] Failed to seed loot tables', error);
    throw error;
  }
}

