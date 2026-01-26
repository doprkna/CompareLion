/**
 * Reward Engine v2
 * Rarity-based loot drops with tier multipliers
 * v0.36.13 - Loot Rarity System
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { RARITY_DROP_MULTIPLIER, EnemyTier } from './rarity';
import { ComputedStats } from './stats';
import { GeneratedEnemy } from './enemyGenerator';

export interface RewardResult {
  xp: number;
  gold: number;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
  // Legacy field for backward compatibility (deprecated, use items array)
  item?: {
    id: string;
    name: string;
    rarity: string;
    itemKey?: string | null;
  } | null;
}

export interface LootTableRow {
  id: string;
  enemyId: string;
  itemId: string | null;
  weight: number;
  minGold: number;
  maxGold: number;
  minXp: number;
  maxXp: number;
}

/**
 * Roll rewards for a fight
 * Handles XP/gold and rarity-based item drops
 */
export async function rollRewardsForFight(params: {
  hero: ComputedStats;
  enemy: GeneratedEnemy | { id: string; xpReward?: number; goldReward?: number; level?: number };
  enemyTier: EnemyTier;
  lootTableRows: LootTableRow[];
}): Promise<RewardResult> {
  const { hero, enemy, enemyTier, lootTableRows } = params;

  // 1. Base XP / Gold
  let xp = 0;
  let gold = 0;

  // XP calculation (unchanged - uses loot table or enemy defaults)
  if (lootTableRows.length > 0) {
    const xpEntries = lootTableRows.filter(row => row.minXp > 0 || row.maxXp > 0);
    if (xpEntries.length > 0) {
      const xpEntry = xpEntries[Math.floor(Math.random() * xpEntries.length)];
      xp = xpEntry.minXp === xpEntry.maxXp
        ? xpEntry.minXp
        : Math.floor(Math.random() * (xpEntry.maxXp - xpEntry.minXp + 1)) + xpEntry.minXp;
    }
  }

  // Fallback to enemy defaults for XP
  if (xp === 0 && 'xpReward' in enemy && enemy.xpReward) {
    xp = enemy.xpReward;
  }

  // Gold calculation - NEW SCALED FORMULA (v0.36.14)
  // Formula: clamp(baseMinGold + floor(enemyTierMultiplier * hero.level * 2), baseMinGold, baseMaxGold + hero.level * 3)
  const TIER_MULTIPLIERS: Record<EnemyTier, number> = {
    easy: 0.8,
    normal: 1.0,
    hard: 1.2,
    elite: 1.5,
  };

  const baseMinGold = 5; // Minimum gold per fight
  const baseMaxGold = 50; // Early-game cap (level 1-10)
  
  const tierMultiplier = TIER_MULTIPLIERS[enemyTier] || 1.0;
  const heroLevel = hero.level || 1;
  
  // Calculate base gold with tier multiplier
  const calculatedGold = baseMinGold + Math.floor(tierMultiplier * heroLevel * 2);
  
  // Cap: baseMaxGold + hero.level * 3 (scales gently)
  const maxGold = baseMaxGold + heroLevel * 3;
  
  // Early-game hard cap: never exceed 50 per fight for levels 1-10
  const earlyGameCap = heroLevel <= 10 ? 50 : maxGold;
  
  // Clamp the result
  gold = Math.max(baseMinGold, Math.min(calculatedGold, earlyGameCap));

  // 2. Item Drop Roll (v0.36.34 - Returns items array)
  const itemRows = lootTableRows.filter(row => row.itemId !== null);
  const droppedItems: Array<{ itemId: string; quantity: number }> = [];
  let droppedItem: RewardResult['item'] = null; // Legacy field

  if (itemRows.length > 0) {
    // Fetch items with rarity
    const itemIds = itemRows.map(row => row.itemId!).filter(Boolean);
    const items = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: {
        id: true,
        name: true,
        rarity: true,
        key: true,
      },
    });

    // Create item map
    const itemMap = new Map(items.map(item => [item.id, item]));

    // Calculate effective weights with rarity multipliers
    const weightedEntries: Array<{ row: LootTableRow; item: typeof items[0]; effectiveWeight: number }> = [];

    for (const row of itemRows) {
      const item = itemMap.get(row.itemId!);
      if (!item) {
        logger.warn(`[RewardsEngine] Item not found for itemId: ${row.itemId}`);
        continue;
      }

      const rarity = (item.rarity || 'common').toLowerCase() as 'common' | 'rare' | 'epic' | 'legendary';
      const multiplier = RARITY_DROP_MULTIPLIER[enemyTier]?.[rarity] || 1.0;
      const effectiveWeight = row.weight * multiplier;

      weightedEntries.push({ row, item, effectiveWeight });
    }

    // Calculate total effective weight
    const totalEffectiveWeight = weightedEntries.reduce((sum, entry) => sum + entry.effectiveWeight, 0);

    // Optional: If total effective weight is very low, 50% chance to drop nothing
    const shouldDropNothing = totalEffectiveWeight < 50 && Math.random() < 0.5;

    if (!shouldDropNothing && totalEffectiveWeight > 0) {
      // Roll weighted random selection
      let random = Math.random() * totalEffectiveWeight;
      let selectedEntry = weightedEntries[0]; // Fallback

      for (const entry of weightedEntries) {
        random -= entry.effectiveWeight;
        if (random <= 0) {
          selectedEntry = entry;
          break;
        }
      }

      // Add to items array (v0.36.34)
      droppedItems.push({
        itemId: selectedEntry.item.id,
        quantity: 1,
      });

      // Legacy field for backward compatibility
      droppedItem = {
        id: selectedEntry.item.id,
        name: selectedEntry.item.name,
        rarity: selectedEntry.item.rarity || 'common',
        itemKey: selectedEntry.item.key,
      };

      logger.debug('[RewardsEngine] Item dropped', {
        itemId: droppedItem.id,
        name: droppedItem.name,
        rarity: droppedItem.rarity,
        enemyTier,
        effectiveWeight: selectedEntry.effectiveWeight,
      });
    }
  }

  logger.debug('[RewardsEngine] Rolled rewards', {
    xp,
    gold,
    itemsCount: droppedItems.length,
    item: droppedItem ? `${droppedItem.name} (${droppedItem.rarity})` : 'none',
    enemyTier,
  });

  return {
    xp,
    gold,
    items: droppedItems, // v0.36.34 - Standardized items array
    item: droppedItem, // Legacy field for backward compatibility
  };
}

/**
 * Grant reward item to user's inventory
 * Uses standardized UserItem system (v0.36.34)
 */
export async function grantRewardItem(
  userId: string,
  itemId: string
): Promise<{ id: string; type?: 'item' | 'pet' } | null> {
  // Check if this is a pet egg (v0.36.32)
  if (itemId.startsWith('pet_egg_')) {
    const petId = itemId.replace('pet_egg_', '');
    try {
      const { unlockPet } = await import('@/lib/services/petService');
      const userPetId = await unlockPet(userId, petId);
      
      // Get pet name for notification
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        select: { name: true },
      });
      
      if (pet) {
        // Send notification
        try {
          const { notifyPetUnlocked } = await import('@/lib/services/notificationService');
          await notifyPetUnlocked(userId, pet.name);
        } catch (error) {
          logger.debug('[RewardsEngine] Pet notification failed', error);
        }
      }
      
      logger.info(`[RewardsEngine] User ${userId} unlocked pet ${petId} from egg`);
      return { id: userPetId, type: 'pet' };
    } catch (error) {
      logger.error(`[RewardsEngine] Failed to unlock pet ${petId}`, error);
      return null;
    }
  }
  
  try {
    // Verify item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        name: true,
        rarity: true,
        power: true,
        key: true,
      },
    });

    if (!item) {
      logger.warn(`[RewardsEngine] Item not found for itemId: ${itemId}`);
      return null;
    }

    // Use standardized addItemToInventory function (v0.36.34)
    const { addItemToInventory } = await import('@/lib/services/itemService');
    const result = await addItemToInventory(userId, itemId, 1);
    
    logger.info(`[RewardsEngine] User ${userId} received item ${item.name} (quantity: ${result.quantity})`);
    
    // Create feed post for loot (v0.36.25)
    try {
      const { postLoot } = await import('@/lib/services/feedService');
      await postLoot(userId, item.id, item.name, item.rarity || 'common');
    } catch (error) {
      // Don't fail item grant if feed post fails
      logger.debug('[RewardsEngine] Feed post failed', error);
    }

    // Create notification for loot drop (v0.36.26)
    try {
      const { notifyLootDrop } = await import('@/lib/services/notificationService');
      await notifyLootDrop(userId, item.name, item.rarity || 'common', item.id);
    } catch (error) {
      // Don't fail item grant if notification fails
      logger.debug('[RewardsEngine] Notification failed', error);
    }
    
    return { id: result.id };
  } catch (error) {
    logger.error(`[RewardsEngine] Error granting item ${itemId} to user ${userId}`, error);
    return null;
  }
}

