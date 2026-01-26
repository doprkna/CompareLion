/**
 * Canonical Stat Engine
 * Single source of truth for hero stat calculation
 * v0.36.11 - Character Sheet Overhaul
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getEquippedCompanionBonuses } from './companion';

// Level scaling formulas (constants for easy tuning)
const HP_PER_LEVEL = 10;
const ATK_PER_LEVEL = 2;
const DEF_PER_LEVEL = 2;
const CRIT_PER_LEVEL = 0; // No scaling unless defined
const SPEED_PER_LEVEL = 0; // No scaling unless defined

// Base stats (level 1)
const BASE_HP = 50;
const BASE_ATK = 5;
const BASE_DEF = 5;
const BASE_CRIT = 5; // %
const BASE_SPEED = 5;

export interface ComputedStats {
  level: number;
  xp: number;
  maxHp: number;
  attackPower: number;
  defense: number;
  critChance: number; // %
  speed: number;
  equipment: Array<{
    id: string;
    name: string;
    type: string;
    rarity: string;
    power: number;
    defense: number | null;
  }>;
  // Companion bonuses (v0.36.20 - Unified companion system)
  xpBonus?: number; // Percentage
  goldBonus?: number; // Percentage
}

/**
 * Compute hero stats - canonical stat engine
 * Unifies base stats, level scaling, and equipment modifiers
 * v0.36.34 - Now uses calculateFinalStats internally
 */
export async function computeHeroStats(userId: string): Promise<ComputedStats> {
  // Use new unified stat system (v0.36.34)
  const { calculateFinalStats } = await import('./finalStats');
  const finalStats = await calculateFinalStats(userId);

  // Fetch equipped items for equipment array (backward compatibility)
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
        },
      },
    },
  });

  // Get companion bonuses for xpBonus/goldBonus (backward compatibility)
  const companionBonuses = await getEquippedCompanionBonuses(userId);

  // Map FinalStats to ComputedStats (backward compatibility)
  const equipment = equippedItems.map((invItem) => {
    const itemPower = invItem.power || 0;
    const rarityMultiplier = getRarityMultiplier(invItem.rarity);
    const adjustedPower = itemPower * rarityMultiplier;
    const itemDefense = invItem.item.defense || 0;
    
    return {
      id: invItem.id,
      name: invItem.item.name,
      type: invItem.item.type || 'unknown',
      rarity: invItem.rarity,
      power: Math.floor(adjustedPower),
      defense: itemDefense ? Math.floor(itemDefense * rarityMultiplier) : null,
    };
  });

  logger.debug('[StatsEngine] Computed hero stats (v0.36.34)', {
    userId,
    level: finalStats.level,
    finalStats,
    equipmentCount: equipment.length,
  });

  return {
    level: finalStats.level,
    xp: finalStats.xp,
    maxHp: finalStats.maxHP,
    attackPower: finalStats.attack,
    defense: finalStats.defense,
    critChance: finalStats.critChance,
    speed: finalStats.speed,
    equipment,
    // Include companion bonuses for reward calculations (v0.36.20)
    xpBonus: companionBonuses.xpBonus,
    goldBonus: companionBonuses.goldBonus,
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

