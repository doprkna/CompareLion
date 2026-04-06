/**
 * Item Service
 * Handles item generation, effects application, and stat calculations
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 * Alpha: Inventory canon = UserItem (stash). CharacterEquipment uses userItemId.
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
 * Apply item effects based on equipped items (dual-read: CharacterEquipment.userItemId first, InventoryItem fallback)
 */
export async function applyItemEffects(
  userId: string,
  trigger: EffectTrigger,
  baseStats: Record<string, number> = {}
): Promise<Record<string, number>> {
  const modifiers: Record<string, number> = { ...baseStats };

  // Canonical: CharacterEquipment.userItemId -> UserItem has no effectKey; Item has effect (string). Skip for now.
  // Legacy: InventoryItem equipped with effectKey
  const legacyItems = await prisma.inventoryItem.findMany({
    where: {
      userId,
      equipped: true,
      effectKey: { not: null },
    },
    select: { effectKey: true },
  });

  for (const invItem of legacyItems) {
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

  for (const [key, value] of Object.entries(modifiers)) {
    if (key.endsWith('Mult')) modifiers[key] = Math.min(value, 3.0);
  }
  return modifiers;
}

/**
 * Get total power bonus from equipped items (dual-read: CharacterEquipment.userItemId first, InventoryItem fallback)
 */
export async function getTotalItemPower(userId: string): Promise<number> {
  let totalPower = 0;

  // Canonical: CharacterEquipment with userItemId -> UserItem -> Item
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeCharacterId: true },
  });
  if (user?.activeCharacterId) {
    const equip = await prisma.characterEquipment.findMany({
      where: { characterId: user.activeCharacterId, userItemId: { not: null } },
      include: { userItem: { include: { item: true } } },
    });
    for (const e of equip) {
      if (!e.userItem?.item) continue;
      const item = e.userItem.item;
      const rarity = (item.rarity || 'common') as RarityKey;
      const power = item.power ?? 0;
      const rarityDef = RARITIES[rarity] || RARITIES.common;
      totalPower += power * rarityDef.rarityMultiplier;
    }
  }

  // Legacy: InventoryItem equipped
  const legacyItems = await prisma.inventoryItem.findMany({
    where: { userId, equipped: true },
  });
  for (const item of legacyItems) {
    const rarityDef = RARITIES[item.rarity as RarityKey] || RARITIES.common;
    totalPower += item.power * rarityDef.rarityMultiplier;
  }

  return Math.floor(totalPower);
}

/**
 * Create inventory item from generated item data (legacy - do not use from RPG paths)
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
  if (process.env.NODE_ENV === 'development') {
    logger.warn('[ItemService] InventoryItem created (legacy). Check caller - use addItemToInventory for RPG.');
  }
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
 * Equip an item (DEPRECATED - writes InventoryItem, legacy only)
 * Use equipCharacterItem(userId, characterId, slot, userItemId) for canonical RPG.
 * Kept for non-RPG callers; RPG routes use canonical API.
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
  throw new Error('Use canonical equip API (characterId, slot, userItemId). equipItem is deprecated for RPG.');
}

/**
 * Unequip an item (DEPRECATED - wrote InventoryItem, legacy only)
 * Use unequipCharacterSlot(userId, characterId, slot) for canonical RPG.
 */
export async function unequipItem(
  userId: string,
  inventoryItemId: string
): Promise<{
  success: boolean;
  unequippedItem: any;
  stats: any;
}> {
  throw new Error('Use canonical unequip API (characterId, slot). unequipItem is deprecated for RPG.');
}

/**
 * Equip item to character slot (alpha canonical - UserItem)
 * Validates character and userItem belong to same user.
 * Inventory canon: UserItem.
 */
export async function equipCharacterItem(
  userId: string,
  characterId: string,
  slot: string,
  userItemId: string
): Promise<{
  success: boolean;
  equipment: { characterId: string; slot: string; userItemId: string };
}> {
  const [character, userItem] = await Promise.all([
    prisma.character.findFirst({ where: { id: characterId, userId } }),
    prisma.userItem.findUnique({
      where: { id: userItemId },
      include: { item: true },
    }),
  ]);

  if (!character) {
    throw new Error('Character not found or not owned');
  }
  if (!userItem) {
    throw new Error('Item not found in stash');
  }
  if (userItem.userId !== userId) {
    throw new Error('Item does not belong to you');
  }

  await prisma.characterEquipment.upsert({
    where: {
      characterId_slot: { characterId, slot },
    },
    create: {
      characterId,
      slot,
      userItemId,
    },
    update: {
      userItemId,
      inventoryItemId: null, // clear legacy when setting canonical
    },
  });

  logger.info('[ItemService] Character item equipped', {
    userId,
    characterId,
    slot,
    userItemId,
  });

  return {
    success: true,
    equipment: { characterId, slot, userItemId },
  };
}

/**
 * Unequip character slot (alpha canonical)
 */
export async function unequipCharacterSlot(
  userId: string,
  characterId: string,
  slot: string
): Promise<{ success: boolean }> {
  const character = await prisma.character.findFirst({
    where: { id: characterId, userId },
  });

  if (!character) {
    throw new Error('Character not found or not owned');
  }

  await prisma.characterEquipment.deleteMany({
    where: { characterId, slot },
  });

  logger.info('[ItemService] Character slot unequipped', {
    userId,
    characterId,
    slot,
  });

  return { success: true };
}

/**
 * Equip a UserItem by itemId (legacy - non-character equip)
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

