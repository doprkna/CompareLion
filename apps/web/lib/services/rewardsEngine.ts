/**
 * Rewards Engine
 * Handles loot table rolls and reward distribution
 * v0.36.7 - Rewards engine + loot tables
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { generateItem, createInventoryItem } from './itemService';

export interface RewardResult {
  xp: number;
  gold: number;
  itemId?: string;
}

/**
 * Roll rewards from loot table for an enemy
 * Uses weighted random selection from loot table entries
 */
export async function rollRewards(enemyId: string): Promise<RewardResult> {
  // Fetch loot table entries for this enemy
  const lootEntries = await prisma.lootTable.findMany({
    where: { enemyId },
  });

  if (lootEntries.length === 0) {
    // Fallback: return default rewards from enemy
    const enemy = await prisma.enemy.findUnique({
      where: { id: enemyId },
      select: {
        xpReward: true,
        goldReward: true,
      },
    });

    return {
      xp: enemy?.xpReward || 0,
      gold: enemy?.goldReward || 0,
    };
  }

  // Calculate total weight
  const totalWeight = lootEntries.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight === 0) {
    // No valid weights, return defaults
    const enemy = await prisma.enemy.findUnique({
      where: { id: enemyId },
      select: {
        xpReward: true,
        goldReward: true,
      },
    });

    return {
      xp: enemy?.xpReward || 0,
      gold: enemy?.goldReward || 0,
    };
  }

  // Weighted random selection
  let random = Math.random() * totalWeight;
  let selectedEntry = lootEntries[0]; // Fallback

  for (const entry of lootEntries) {
    random -= entry.weight;
    if (random <= 0) {
      selectedEntry = entry;
      break;
    }
  }

  // Roll XP and gold in ranges
  const xp = selectedEntry.minXp === selectedEntry.maxXp
    ? selectedEntry.minXp
    : Math.floor(Math.random() * (selectedEntry.maxXp - selectedEntry.minXp + 1)) + selectedEntry.minXp;

  const gold = selectedEntry.minGold === selectedEntry.maxGold
    ? selectedEntry.minGold
    : Math.floor(Math.random() * (selectedEntry.maxGold - selectedEntry.minGold + 1)) + selectedEntry.minGold;

  // Handle item reward
  let itemId: string | undefined;
  if (selectedEntry.itemId) {
    itemId = selectedEntry.itemId;
  }

  logger.debug('[RewardsEngine] Rolled rewards', {
    enemyId,
    selectedEntry: selectedEntry.id,
    xp,
    gold,
    itemId,
  });

  return {
    xp,
    gold,
    itemId,
  };
}

/**
 * Grant reward item to user
 * Creates inventory item from itemId or generates new item
 */
export async function grantRewardItem(
  userId: string,
  itemId?: string
): Promise<{ id: string } | null> {
  if (!itemId) {
    return null;
  }

  try {
    // Check if itemId refers to an existing Item
    const existingItem = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (existingItem) {
      // Create inventory item from existing item
      const inventoryItem = await prisma.inventoryItem.create({
        data: {
          userId,
          itemId: existingItem.id,
          itemKey: existingItem.key || undefined,
          rarity: existingItem.rarity,
          power: existingItem.power || 0,
          equipped: false,
        },
      });

      return { id: inventoryItem.id };
    }

    // If itemId is a string like "potion", "fang", "dagger", etc., generate item
    // For now, generate a random item
    const itemData = await generateItem();
    const inventoryItem = await createInventoryItem(userId, itemId, itemData);

    return inventoryItem;
  } catch (error) {
    logger.error('[RewardsEngine] Failed to grant reward item', error);
    return null;
  }
}

