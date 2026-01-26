/**
 * Loot Service 2.0
 * Full RPG-grade loot system with rarity tiers, weighted rolls, smart-drop protection
 * v0.36.30 - Loot System 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { notify } from '@/lib/notify';
import { grantRewardItem } from '@/lib/rpg/rewards';

// Global rarity weights (default)
const DEFAULT_RARITY_WEIGHTS = {
  common: 70,
  uncommon: 20,
  rare: 7,
  epic: 2,
  legendary: 1,
};

// Rarity order for smart-drop protection
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export interface LootTableData {
  items: Record<string, string[]>; // { "common": [itemIds], "rare": [...] }
  weights: Record<string, number>; // { "common": 70, "rare": 25 }
}

export interface LootDropResult {
  itemId: string;
  itemName: string;
  rarity: string;
  item?: {
    id: string;
    name: string;
    emoji: string;
    icon: string;
    rarity: string;
  };
}

/**
 * Get loot table by enemy type or name
 */
export async function getLootTable(enemyType?: string, tableName?: string) {
  const where: any = {};
  if (enemyType) {
    where.enemyType = enemyType;
  }
  if (tableName) {
    where.name = tableName;
  }

  const lootTable = await prisma.lootTable.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
  });

  if (!lootTable) {
    return null;
  }

  return {
    id: lootTable.id,
    name: lootTable.name,
    enemyType: lootTable.enemyType,
    items: lootTable.items as LootTableData['items'],
    weights: (lootTable.weights as LootTableData['weights']) || DEFAULT_RARITY_WEIGHTS,
  };
}

/**
 * Roll rarity using weighted RNG
 */
function rollRarity(weights: Record<string, number>): string {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) {
      return rarity;
    }
  }

  // Fallback to common
  return 'common';
}

/**
 * Get user's recent loot drops for smart-drop protection
 */
async function getRecentLootDrops(userId: string, limit: number = 5): Promise<string[]> {
  // Get recent inventory items (last 5 created)
  const recentItems = await prisma.inventoryItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      item: {
        select: {
          id: true,
          rarity: true,
        },
      },
    },
  });

  return recentItems
    .filter(item => item.item?.rarity === 'common')
    .map(item => item.itemId);
}

/**
 * Smart-drop protection: prevent 3+ duplicate common items in a row
 */
async function applySmartDropProtection(
  userId: string,
  rolledRarity: string,
  lootTable: ReturnType<typeof getLootTable> extends Promise<infer T> ? T : never
): Promise<string> {
  if (rolledRarity !== 'common') {
    return rolledRarity; // Only protect against common duplicates
  }

  const recentDrops = await getRecentLootDrops(userId, 3);
  if (recentDrops.length < 3) {
    return rolledRarity; // Not enough history
  }

  // Check if last 3 are the same item
  const lastItemId = recentDrops[0];
  const isDuplicate = recentDrops.slice(0, 3).every(id => id === lastItemId);

  if (isDuplicate && lootTable) {
    // Re-roll rarity once (upgrade to uncommon)
    logger.info(`[LootService] Smart-drop protection: re-rolling common duplicate for user ${userId}`);
    return 'uncommon';
  }

  return rolledRarity;
}

/**
 * Roll loot drop from loot table
 * Returns item with rarity
 */
export async function rollLootDrop(
  userId: string,
  enemyType?: string,
  tableName?: string
): Promise<LootDropResult | null> {
  // Get loot table
  const lootTable = await getLootTable(enemyType, tableName);
  if (!lootTable) {
    logger.warn(`[LootService] No loot table found for enemyType: ${enemyType}, tableName: ${tableName}`);
    return null;
  }

  // Roll rarity
  let rolledRarity = rollRarity(lootTable.weights);

  // Apply smart-drop protection
  rolledRarity = await applySmartDropProtection(userId, rolledRarity, lootTable);

  // Get items for rolled rarity
  const itemsForRarity = lootTable.items[rolledRarity] || [];
  if (itemsForRarity.length === 0) {
    // Fallback to common if rarity bucket is empty
    rolledRarity = 'common';
    const fallbackItems = lootTable.items['common'] || [];
    if (fallbackItems.length === 0) {
      logger.warn(`[LootService] No items in loot table ${lootTable.id}`);
      return null;
    }
  }

  const finalItems = lootTable.items[rolledRarity] || lootTable.items['common'] || [];
  const randomItemId = finalItems[Math.floor(Math.random() * finalItems.length)];

  // Fetch item details
  const item = await prisma.item.findUnique({
    where: { id: randomItemId },
    select: {
      id: true,
      name: true,
      emoji: true,
      icon: true,
      rarity: true,
    },
  });

  if (!item) {
    logger.warn(`[LootService] Item not found: ${randomItemId}`);
    return null;
  }

  return {
    itemId: item.id,
    itemName: item.name,
    rarity: rolledRarity,
    item: {
      id: item.id,
      name: item.name,
      emoji: item.emoji || item.icon || '📦',
      icon: item.icon || item.emoji || '📦',
      rarity: rolledRarity,
    },
  };
}

/**
 * Grant loot drop to user
 * Adds item to inventory, sends notification
 */
export async function grantLootDrop(
  userId: string,
  lootDrop: LootDropResult
): Promise<{ success: boolean; inventoryItemId?: string }> {
  try {
    // Grant item to inventory
    const inventoryItem = await grantRewardItem(userId, lootDrop.itemId);
    if (!inventoryItem) {
      throw new Error('Failed to grant item');
    }

    // Send notification
    try {
      await notify(
        userId,
        'loot_drop',
        'You found loot!',
        `${lootDrop.rarity} ${lootDrop.itemName}`
      );
    } catch (error) {
      logger.debug('[LootService] Notification failed', error);
    }

    logger.info(`[LootService] Granted ${lootDrop.rarity} ${lootDrop.itemName} to user ${userId}`);

    return {
      success: true,
      inventoryItemId: inventoryItem.id,
    };
  } catch (error) {
    logger.error(`[LootService] Failed to grant loot drop`, error);
    return { success: false };
  }
}

/**
 * Process fight drop
 * Main entry point for fight completion loot
 */
export async function processFightDrop(
  userId: string,
  fightId: string,
  enemyType?: string
): Promise<LootDropResult | null> {
  try {
    // Roll loot drop
    const lootDrop = await rollLootDrop(userId, enemyType);

    if (!lootDrop) {
      return null;
    }

    // Grant to user
    await grantLootDrop(userId, lootDrop);

    return lootDrop;
  } catch (error) {
    logger.error(`[LootService] Failed to process fight drop`, error);
    return null;
  }
}

