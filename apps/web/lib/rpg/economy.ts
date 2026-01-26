/**
 * Economy Pricing System
 * Defines item pricing formulas and gold management
 * v0.36.14 - Economy Sanity Pass
 */

export const BASE_PRICE: Record<string, number> = {
  common: 20,
  rare: 60,
  epic: 150,
  legendary: 400,
};

export const STAT_VALUE: Record<string, number> = {
  hp: 1,
  atk: 5,
  def: 5,
  crit: 10,
  speed: 8,
};

export interface ItemStats {
  rarity: string;
  hp?: number;
  atk?: number;
  def?: number;
  crit?: number;
  speed?: number;
  // Fallback: if item has power/defense instead
  power?: number;
  defense?: number | null;
}

/**
 * Calculate item price based on rarity and stats
 * Formula: rarityBase + statValue
 * 
 * Stat value = hp*1 + atk*5 + def*5 + crit*10 + speed*8
 * 
 * If item has power/defense instead of direct stats:
 * - hp = power * 0.2
 * - atk = power * 0.8
 * - def = defense || 0
 */
export function calculateItemPrice(item: ItemStats): number {
  const rarity = (item.rarity || 'common').toLowerCase();
  const rarityBase = BASE_PRICE[rarity] || BASE_PRICE.common;

  let statValue = 0;

  // If item has direct stat fields, use them
  if (item.hp !== undefined || item.atk !== undefined || item.def !== undefined) {
    statValue =
      (item.hp || 0) * STAT_VALUE.hp +
      (item.atk || 0) * STAT_VALUE.atk +
      (item.def || 0) * STAT_VALUE.def +
      (item.crit || 0) * STAT_VALUE.crit +
      (item.speed || 0) * STAT_VALUE.speed;
  } else if (item.power !== undefined) {
    // Fallback: derive stats from power/defense
    // Power contributes 80% to attack, 20% to HP (based on stats.ts logic)
    const derivedHp = (item.power || 0) * 0.2;
    const derivedAtk = (item.power || 0) * 0.8;
    const derivedDef = item.defense || 0;

    statValue =
      derivedHp * STAT_VALUE.hp +
      derivedAtk * STAT_VALUE.atk +
      derivedDef * STAT_VALUE.def;
    // crit and speed default to 0 for items
  }

  const price = rarityBase + statValue;
  return Math.max(1, Math.floor(price)); // Ensure minimum price of 1
}

