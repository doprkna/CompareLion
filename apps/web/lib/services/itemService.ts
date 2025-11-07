/**
 * Item Service
 * Handles item generation, effects application, and stat calculations
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { RARITIES, rollRarity, generatePowerForRarity, RarityKey } from '@/lib/config/rarityConfig';
import { ITEM_EFFECTS } from '@/lib/config/itemEffects';

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

