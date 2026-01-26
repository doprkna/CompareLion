/**
 * Item Service
 * Handles item generation, effects application, and stat calculations
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { RARITIES, rollRarity, generatePowerForRarity, RarityKey } from '@parel/core/config/rarityConfig';
import { ITEM_EFFECTS } from '@parel/core/config/itemEffects';
import { updateHeroStats } from '@/lib/services/progressionService';

export interface ItemEffectResult {
  damageMult?: number; // Multiplier for damage
  lifeSteal?: number; // HP restored
  critChance?: number; // Additional crit chance (0-1)
  xpBonus?: number; // Additional XP
  goldBonus?: number; // Additional gold
  hpBonus?: number; // Flat HP gain
}

export type EffectTrigger = 'onAttack' | 'onKill' | 'onCrit' | 'onStart' | 'onRest';

/**
 * Generate a new item with random rarity, power, and effect
 */
export async function generateItem(
  rarity?: RarityKey,
  itemKey?: string
): Promise<{
  rarity: RarityKey;
  power: number;
  effectKey: string | null;
  itemKey: string;
}> {
  // Roll rarity if not provided
  const rolledRarity = rarity || rollRarity();
  const power = generatePowerForRarity(rolledRarity);

  // Get random effect (if available)
  const effects = await prisma.itemEffect.findMany({
    where: {
      type: 'buff', // Start with buffs, can expand later
    },
  });

  let effectKey: string | null = null;
  if (effects.length > 0 && Math.random() < 0.6) {
    // 60% chance to have an effect
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    effectKey = randomEffect.key;
  }

  // Generate item key if not provided
  let generatedItemKey = itemKey;
  if (!generatedItemKey) {
    const rarityPrefix = rolledRarity.charAt(0).toUpperCase();
    const type = ['Sword', 'Shield', 'Amulet', 'Ring', 'Boots', 'Helmet'][
      Math.floor(Math.random() * 6)
    ];
    generatedItemKey = `${rarityPrefix}-${type}-${Date.now().toString(36)}`.toLowerCase();
  }

  logger.debug('[ItemService] Generated item', {
    rarity: rolledRarity,
    power,
    effectKey,
    itemKey: generatedItemKey,
  });

  return {
    rarity: rolledRarity,
    power,
    effectKey,
    itemKey: generatedItemKey,
  };
}

/**
 * Apply item effects based on equipped items and trigger event
 */
export async function applyItemEffects(
  userId: string,
  trigger: EffectTrigger,
  baseStats: Record<string, number> = {}
): Promise<Record<string, number>> {
  // Get all equipped items with effects
  const equippedItems = await prisma.inventoryItem.findMany({
    where: {
      userId,
      equipped: true,
      effectKey: { not: null },
    },
    select: {
      effectKey: true,
    },
  });

  // Start with provided base stats
  const modifiers: Record<string, number> = { ...baseStats };

  for (const invItem of equippedItems) {
    if (!invItem.effectKey) continue;

    const def = ITEM_EFFECTS[invItem.effectKey];
    if (!def || def.trigger !== trigger) continue;

    logger.debug('[ItemEffect]', { userId, trigger, effectKey: invItem.effectKey });

    switch (def.type) {
      case 'buff':
      case 'passive': {
        const current = modifiers[def.prop] ?? 1;
        modifiers[def.prop] = current * def.value;
        break;
      }
      case 'heal': {
        const current = modifiers[def.prop] ?? 0;
        modifiers[def.prop] = current + def.value;
        break;
      }
    }
  }

  // Safety caps for multipliers (<= 3x)
  for (const [key, value] of Object.entries(modifiers)) {
    if (key.endsWith('Mult')) {
      modifiers[key] = Math.min(value, 3.0);
    }
  }

  return modifiers;
}

/**
 * Get total power bonus from equipped items (with rarity multipliers)
 */
export async function getTotalItemPower(userId: string): Promise<number> {
  const equippedItems = await prisma.inventoryItem.findMany({
    where: {
      userId,
      equipped: true,
    },
  });

  let totalPower = 0;

  for (const item of equippedItems) {
    const rarityDef = RARITIES[item.rarity as RarityKey] || RARITIES.common;
    const itemPower = item.power * rarityDef.rarityMultiplier;
    totalPower += itemPower;
  }

  return Math.floor(totalPower);
}

/**
 * Create inventory item from generated item data
 */
export async function createInventoryItem(
  userId: string,
  itemId: string,
  itemData: {
    rarity: RarityKey;
    power: number;
    effectKey: string | null;
    itemKey: string;
  }
): Promise<{ id: string }> {
  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      userId,
      itemId,
      itemKey: itemData.itemKey,
      rarity: itemData.rarity,
      power: itemData.power,
      effectKey: itemData.effectKey,
      equipped: false,
    },
  });

  return { id: inventoryItem.id };
}

/**
 * Equip an item - moves from inventory to equipped slot
 * Unequips existing item of same type if any
 * v0.36.3 - Equipment/inventory sync
 */
export async function equipItem(
  userId: string,
  inventoryItemId: string
): Promise<{
  success: boolean;
  equippedItem: any;
  unequippedItem?: any;
  stats: any;
}> {
  // Verify ownership and get item with type
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
    include: {
      item: true,
    },
  });

  if (!inventoryItem) {
    throw new Error('Inventory item not found');
  }

  if (inventoryItem.userId !== userId) {
    throw new Error('Not authorized to equip this item');
  }

  // If already equipped, do nothing
  if (inventoryItem.equipped) {
    const stats = await updateHeroStats(userId);
    return {
      success: true,
      equippedItem: inventoryItem,
      stats,
    };
  }

  // Find existing equipped item of same type (if slot-based)
  // For now, we allow multiple items equipped, but we can unequip same type if needed
  const itemType = inventoryItem.item?.type;
  let unequippedItem = null;

  if (itemType) {
    // Find other equipped items of same type and unequip them (one per type)
    const existingEquipped = await prisma.inventoryItem.findFirst({
      where: {
        userId,
        equipped: true,
        item: {
          type: itemType,
        },
        id: { not: inventoryItemId },
      },
    });

    if (existingEquipped) {
      unequippedItem = await prisma.inventoryItem.update({
        where: { id: existingEquipped.id },
        data: { equipped: false },
      });
    }
  }

  // Equip the new item
  const equippedItem = await prisma.inventoryItem.update({
    where: { id: inventoryItemId },
    data: { equipped: true },
    include: {
      item: true,
    },
  });

  // Update hero stats
  const stats = await updateHeroStats(userId);

  logger.info('[ItemService] Item equipped', {
    userId,
    inventoryItemId,
    itemType,
    unequippedItemId: unequippedItem?.id,
  });

  return {
    success: true,
    equippedItem,
    unequippedItem: unequippedItem || undefined,
    stats,
  };
}

/**
 * Unequip an item - moves from equipped slot back to inventory
 * v0.36.3 - Equipment/inventory sync
 */
export async function unequipItem(
  userId: string,
  inventoryItemId: string
): Promise<{
  success: boolean;
  unequippedItem: any;
  stats: any;
}> {
  // Verify ownership
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
  });

  if (!inventoryItem) {
    throw new Error('Inventory item not found');
  }

  if (inventoryItem.userId !== userId) {
    throw new Error('Not authorized to unequip this item');
  }

  if (!inventoryItem.equipped) {
    // Already unequipped, just return stats
    const stats = await updateHeroStats(userId);
    return {
      success: true,
      unequippedItem: inventoryItem,
      stats,
    };
  }

  // Unequip the item
  const unequippedItem = await prisma.inventoryItem.update({
    where: { id: inventoryItemId },
    data: { equipped: false },
    include: {
      item: true,
    },
  });

  // Update hero stats
  const stats = await updateHeroStats(userId);

  logger.info('[ItemService] Item unequipped', {
    userId,
    inventoryItemId,
  });

  return {
    success: true,
    unequippedItem,
    stats,
  };
}

/**
 * Equip a UserItem by itemId
 * Enforces slot rules: only 1 item per slot, unequips previous item in same slot
 * v0.36.34 - Standardized inventory system
 */
export async function equipUserItem(
  userId: string,
  itemId: string
): Promise<{
  success: boolean;
  equippedItem: any;
  unequippedItem?: any;
  stats: any;
}> {
  // Get UserItem with Item data
  const userItem = await prisma.userItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    include: {
      item: true,
    },
  });

  if (!userItem) {
    throw new Error('Item not found in inventory');
  }

  // Check if item has a slot (equipment only)
  const slot = userItem.item.slot;
  if (!slot) {
    throw new Error('This item cannot be equipped (no slot)');
  }

  // If already equipped, do nothing
  if (userItem.equipped) {
    const stats = await updateHeroStats(userId);
    return {
      success: true,
      equippedItem: userItem,
      stats,
    };
  }

  // Find and unequip existing item in same slot
  let unequippedItem = null;
  const existingEquipped = await prisma.userItem.findFirst({
    where: {
      userId,
      equipped: true,
      item: {
        slot: slot,
      },
      itemId: { not: itemId },
    },
    include: {
      item: true,
    },
  });

  if (existingEquipped) {
    unequippedItem = await prisma.userItem.update({
      where: { id: existingEquipped.id },
      data: { equipped: false },
      include: {
        item: true,
      },
    });
  }

  // Equip the new item
  const equippedItem = await prisma.userItem.update({
    where: { id: userItem.id },
    data: { equipped: true },
    include: {
      item: true,
    },
  });

  // Update hero stats
  const stats = await updateHeroStats(userId);

  logger.info('[ItemService] UserItem equipped', {
    userId,
    itemId,
    slot,
    unequippedItemId: unequippedItem?.id,
  });

  return {
    success: true,
    equippedItem,
    unequippedItem: unequippedItem || undefined,
    stats,
  };
}

/**
 * Unequip a UserItem by itemId
 * v0.36.34 - Standardized inventory system
 */
export async function unequipUserItem(
  userId: string,
  itemId: string
): Promise<{
  success: boolean;
  unequippedItem: any;
  stats: any;
}> {
  // Get UserItem
  const userItem = await prisma.userItem.findUnique({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    include: {
      item: true,
    },
  });

  if (!userItem) {
    throw new Error('Item not found in inventory');
  }

  if (!userItem.equipped) {
    // Already unequipped, just return stats
    const stats = await updateHeroStats(userId);
    return {
      success: true,
      unequippedItem: userItem,
      stats,
    };
  }

  // Unequip the item
  const unequippedItem = await prisma.userItem.update({
    where: { id: userItem.id },
    data: { equipped: false },
    include: {
      item: true,
    },
  });

  // Update hero stats
  const stats = await updateHeroStats(userId);

  logger.info('[ItemService] UserItem unequipped', {
    userId,
    itemId,
  });

  return {
    success: true,
    unequippedItem,
    stats,
  };
}

/**
 * Add item to user inventory (internal use, for loot system)
 * v0.36.34 - Standardized inventory system
 */
export async function addItemToInventory(
  userId: string,
  itemId: string,
  quantity: number = 1
): Promise<{ id: string; quantity: number }> {
  const userItem = await prisma.userItem.upsert({
    where: {
      userId_itemId: {
        userId,
        itemId,
      },
    },
    create: {
      userId,
      itemId,
      quantity,
      equipped: false,
    },
    update: {
      quantity: { increment: quantity },
    },
  });

  logger.info('[ItemService] Item added to inventory', {
    userId,
    itemId,
    quantity: userItem.quantity,
  });

  return {
    id: userItem.id,
    quantity: userItem.quantity,
  };
}

