/**
 * Final Stats Calculator
 * Unified stat system with base attributes and derived stats
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getEquippedCompanionBonuses } from './companion';
import { getUserPassiveSkills } from '@/lib/services/skillService';
import { calculatePassiveBonuses } from '@/lib/services/combatRunner';

export interface BaseAttributes {
  strength: number;    // STR
  agility: number;     // AGI
  endurance: number;   // END
  intellect: number;   // INT
  luck: number;        // LCK
}

export interface FinalStats {
  // Base attributes
  baseAttributes: BaseAttributes;
  
  // Derived attributes
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  critChance: number;  // %
  critDamage: number; // % (constant 150% for MVP)
  lootLuck: number;   // %
  
  // Meta
  level: number;
  xp: number;
  unspentPoints: number;
}

/**
 * Calculate final stats from base attributes + equipment + passive skills
 * 
 * Formulas:
 * - maxHP = END * 10 + level * 5
 * - attack = STR * 2 + weaponPower
 * - defense = END * 1.5 + armorPower
 * - speed = AGI * 1.2
 * - critChance = LCK * 0.2 + passiveBonus
 * - critDamage = 150% (constant)
 * - lootLuck = LCK * 0.1 + passiveBonus
 */
export async function calculateFinalStats(userId: string): Promise<FinalStats> {
  // 1. Fetch user with attributes
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      level: true,
      xp: true,
      strength: true,
      agility: true,
      endurance: true,
      intellect: true,
      luck: true,
      unspentPoints: true,
      stats: true, // Legacy stats JSON for backward compatibility
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const level = user.level || 1;
  const xp = user.xp || 0;

  // 2. Get base attributes (new system) or fallback to legacy stats
  let baseAttributes: BaseAttributes;
  
  if (user.strength !== null && user.strength !== undefined &&
      user.agility !== null && user.agility !== undefined &&
      user.endurance !== null && user.endurance !== undefined &&
      user.intellect !== null && user.intellect !== undefined &&
      user.luck !== null && user.luck !== undefined) {
    // New system: use direct fields
    baseAttributes = {
      strength: user.strength || 5,
      agility: user.agility || 5,
      endurance: user.endurance || 5,
      intellect: user.intellect || 5,
      luck: user.luck || 5,
    };
  } else {
    // Legacy system: map from stats JSON
    const legacyStats = (user.stats || {}) as { str?: number; int?: number; cha?: number; luck?: number };
    baseAttributes = {
      strength: legacyStats.str || 5,
      agility: legacyStats.luck || 5, // AGI maps from luck in legacy
      endurance: legacyStats.cha || 5, // END maps from cha in legacy
      intellect: legacyStats.int || 5,
      luck: legacyStats.luck || 5,
    };
  }

  // 3. Fetch equipped items
  const equippedItems = await prisma.inventoryItem.findMany({
    where: {
      userId,
      equipped: true,
    },
    include: {
      item: {
        select: {
          id: true,
          name: true,
          type: true,
          power: true,
          defense: true,
          rarity: true,
        },
      },
    },
  });

  // 4. Calculate weapon power and armor power
  let weaponPower = 0;
  let armorPower = 0;

  for (const invItem of equippedItems) {
    const itemPower = invItem.power || 0;
    const itemDefense = invItem.item.defense || 0;
    const rarity = invItem.rarity || 'common';
    
    // Rarity multipliers
    const rarityMultiplier = getRarityMultiplier(rarity);
    const adjustedPower = itemPower * rarityMultiplier;
    const adjustedDefense = itemDefense * rarityMultiplier;

    // Weapon power (from weapon-type items)
    if (invItem.item.type === 'weapon' || invItem.item.type === 'sword' || invItem.item.type === 'staff') {
      weaponPower += Math.floor(adjustedPower);
    } else {
      // Other items contribute 50% to weapon power
      weaponPower += Math.floor(adjustedPower * 0.5);
    }

    // Armor power (from armor-type items)
    if (invItem.item.type === 'armor' || invItem.item.type === 'shield' || invItem.item.type === 'helmet') {
      armorPower += Math.floor(adjustedDefense);
    } else {
      // Other items contribute 30% to armor power
      armorPower += Math.floor(adjustedDefense * 0.3);
    }
  }

  // 5. Get passive skill bonuses
  const passiveSkills = await getUserPassiveSkills(userId);
  const passiveBonuses = calculatePassiveBonuses(passiveSkills);

  // 6. Get companion bonuses
  const companionBonuses = await getEquippedCompanionBonuses(userId);

  // 7. Calculate derived stats
  const maxHP = Math.floor(baseAttributes.endurance * 10 + level * 5);
  const attack = Math.floor(baseAttributes.strength * 2 + weaponPower + companionBonuses.atkBonus);
  const defense = Math.floor(baseAttributes.endurance * 1.5 + armorPower + companionBonuses.defBonus);
  const speed = Math.floor(baseAttributes.agility * 1.2 + companionBonuses.speedBonus + passiveBonuses.speed);
  const critChance = Math.min(50, baseAttributes.luck * 0.2 + companionBonuses.critBonus + passiveBonuses.critChancePercent);
  const critDamage = 150; // Constant 150% for MVP
  const lootLuck = baseAttributes.luck * 0.1 + passiveBonuses.lootLuckPercent;

  logger.debug('[FinalStats] Calculated final stats', {
    userId,
    level,
    baseAttributes,
    weaponPower,
    armorPower,
    passiveBonuses,
    companionBonuses,
    finalStats: { maxHP, attack, defense, speed, critChance, critDamage, lootLuck },
  });

  return {
    baseAttributes,
    maxHP,
    attack,
    defense,
    speed,
    critChance,
    critDamage,
    lootLuck,
    level,
    xp,
    unspentPoints: user.unspentPoints || 0,
  };
}

/**
 * Get rarity multiplier for stat calculations
 */
function getRarityMultiplier(rarity: string): number {
  const multipliers: Record<string, number> = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0,
    alpha: 4.0,
  };
  return multipliers[rarity.toLowerCase()] || 1.0;
}

