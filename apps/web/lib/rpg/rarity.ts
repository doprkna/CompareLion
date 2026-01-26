/**
 * Rarity Constants
 * Defines rarity order and drop multipliers by tier
 * v0.36.13 - Loot Rarity System
 */

export const RARITY_ORDER = ["common", "rare", "epic", "legendary"] as const;

export type RarityKey = typeof RARITY_ORDER[number];

export type EnemyTier = "easy" | "normal" | "hard" | "elite";

/**
 * Rarity drop multipliers by enemy tier
 * Multipliers affect the effective weight of items when rolling drops
 */
export const RARITY_DROP_MULTIPLIER: Record<EnemyTier, Record<RarityKey, number>> = {
  easy: {
    common: 1.0,
    rare: 0.5,
    epic: 0.1,
    legendary: 0.02,
  },
  normal: {
    common: 1.0,
    rare: 0.7,
    epic: 0.2,
    legendary: 0.05,
  },
  hard: {
    common: 1.0,
    rare: 1.0,
    epic: 0.4,
    legendary: 0.1,
  },
  elite: {
    common: 0.8,
    rare: 1.2,
    epic: 0.5,
    legendary: 0.2,
  },
};

/**
 * Get rarity color class for UI
 */
export function getRarityColorClass(rarity: string): string {
  const normalizedRarity = rarity.toLowerCase();
  switch (normalizedRarity) {
    case "common":
      return "text-slate-300";
    case "rare":
      return "text-sky-400";
    case "epic":
      return "text-purple-400";
    case "legendary":
      return "text-amber-400";
    default:
      return "text-gray-400";
  }
}

/**
 * Get rarity background color class for UI
 */
export function getRarityBgClass(rarity: string): string {
  const normalizedRarity = rarity.toLowerCase();
  switch (normalizedRarity) {
    case "common":
      return "bg-slate-800 border-slate-700";
    case "rare":
      return "bg-sky-900/30 border-sky-700";
    case "epic":
      return "bg-purple-900/30 border-purple-700";
    case "legendary":
      return "bg-amber-900/30 border-amber-700";
    default:
      return "bg-gray-800 border-gray-700";
  }
}

/**
 * Get rarity display name
 */
export function getRarityDisplayName(rarity: string): string {
  const normalizedRarity = rarity.toLowerCase();
  switch (normalizedRarity) {
    case "common":
      return "COMMON";
    case "rare":
      return "RARE";
    case "epic":
      return "EPIC";
    case "legendary":
      return "LEGENDARY";
    default:
      return rarity.toUpperCase();
  }
}

