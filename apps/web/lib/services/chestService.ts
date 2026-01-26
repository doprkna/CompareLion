/**
 * Chest Service
 * Handle chest opening, daily login chests, chest rewards
 * v0.36.30 - Loot System 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { notify } from '@/lib/notify';
import { grantRewardItem } from '@/lib/rpg/rewards';
import { rollLootDrop, grantLootDrop } from './lootService';

export interface ChestReward {
  itemId: string;
  itemName: string;
  rarity: string;
  quantity: number;
}

export interface ChestOpenResult {
  success: boolean;
  items: ChestReward[];
  gold?: number;
  xp?: number;
}

/**
 * Get chest by type
 */
export async function getChestByType(chestType: string) {
  return await prisma.chest.findFirst({
    where: { chestType },
    include: {
      lootTable: true,
    },
  });
}

/**
 * Open a chest
 * Returns items, gold, XP based on chest quality
 */
export async function openChest(
  userId: string,
  userChestId: string
): Promise<ChestOpenResult> {
  // Verify user owns chest
  const userChest = await prisma.userChest.findUnique({
    where: { id: userChestId },
    include: {
      chest: {
        include: {
          lootTable: true,
        },
      },
    },
  });

  if (!userChest) {
    throw new Error('Chest not found');
  }

  if (userChest.userId !== userId) {
    throw new Error('Not authorized to open this chest');
  }

  if (userChest.opened) {
    throw new Error('Chest already opened');
  }

  const chest = userChest.chest;
  const lootTable = chest.lootTable;

  // Determine number of items based on chest type
  const itemCounts: Record<string, number> = {
    wooden: 1,
    silver: 2,
    gold: 3,
    event: 2,
  };

  const itemCount = itemCounts[chest.chestType] || 1;

  // Roll items from loot table
  const items: ChestReward[] = [];
  for (let i = 0; i < itemCount; i++) {
    const lootDrop = await rollLootDrop(userId, undefined, lootTable.name);
    if (lootDrop) {
      // Grant item
      await grantLootDrop(userId, lootDrop);
      items.push({
        itemId: lootDrop.itemId,
        itemName: lootDrop.itemName,
        rarity: lootDrop.rarity,
        quantity: 1,
      });
    }
  }

  // Grant bonus gold/XP based on chest type
  const bonuses: Record<string, { gold: number; xp: number }> = {
    wooden: { gold: 10, xp: 5 },
    silver: { gold: 25, xp: 15 },
    gold: { gold: 50, xp: 30 },
    event: { gold: 20, xp: 10 },
  };

  const bonus = bonuses[chest.chestType] || { gold: 0, xp: 0 };

  if (bonus.gold > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { funds: { increment: bonus.gold } },
    });
  }

  // Mark chest as opened
  await prisma.userChest.update({
    where: { id: userChestId },
    data: { opened: true },
  });

  // Send notification
  try {
    await notify(
      userId,
      'chest_opened',
      'Chest Opened',
      `You received ${items.length} items.`
    );
  } catch (error) {
    logger.debug('[ChestService] Notification failed', error);
  }

  logger.info(`[ChestService] User ${userId} opened chest ${userChestId}, received ${items.length} items`);

  return {
    success: true,
    items,
    gold: bonus.gold,
    xp: bonus.xp,
  };
}

/**
 * Grant daily login chest
 * Creates a wooden chest for the user
 */
export async function grantDailyLoginChest(userId: string): Promise<string | null> {
  try {
    // Check if user already received daily chest today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingChest = await prisma.userChest.findFirst({
      where: {
        userId,
        createdAt: {
          gte: today,
        },
        opened: false,
      },
      include: {
        chest: {
          where: {
            chestType: 'wooden',
          },
        },
      },
    });

    if (existingChest) {
      return existingChest.id; // Already granted today
    }

    // Get or create daily login chest
    let chest = await getChestByType('wooden');
    if (!chest) {
      // Create default daily login loot table if it doesn't exist
      const dailyLootTable = await prisma.lootTable.upsert({
        where: { name: 'daily_login' },
        update: {},
        create: {
          name: 'daily_login',
          enemyType: null,
          items: {
            common: [], // Will be seeded by admin
            uncommon: [],
          },
          weights: {
            common: 70,
            uncommon: 30,
          },
        },
      });

      chest = await prisma.chest.create({
        data: {
          chestType: 'wooden',
          lootTableId: dailyLootTable.id,
        },
      });
    }

    // Create user chest
    const userChest = await prisma.userChest.create({
      data: {
        userId,
        chestId: chest.id,
        opened: false,
      },
    });

    logger.info(`[ChestService] Granted daily login chest to user ${userId}`);

    return userChest.id;
  } catch (error) {
    logger.error(`[ChestService] Failed to grant daily login chest`, error);
    return null;
  }
}

/**
 * Get user's unopened chests
 */
export async function getUserChests(userId: string) {
  const userChests = await prisma.userChest.findMany({
    where: {
      userId,
      opened: false,
    },
    include: {
      chest: {
        include: {
          lootTable: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50, // Max 50 chests
  });

  return userChests.map(uc => ({
    id: uc.id,
    chestType: uc.chest.chestType,
    createdAt: uc.createdAt,
  }));
}

