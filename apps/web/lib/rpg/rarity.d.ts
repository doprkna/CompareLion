/**
 * Rarity Constants
 * Defines rarity order and drop multipliers by tier
 * v0.36.13 - Loot Rarity System
 */
export declare const RARITY_ORDER: readonly ["common", "rare", "epic", "legendary"];
export type RarityKey = typeof RARITY_ORDER[number];
export type EnemyTier = "easy" | "normal" | "hard" | "elite";
/**
 * Rarity drop multipliers by enemy tier
 * Multipliers affect the effective weight of items when rolling drops
 */
export declare const RARITY_DROP_MULTIPLIER: Record<EnemyTier, Record<RarityKey, number>>;
/**
 * Get rarity color class for UI
 */
export declare function getRarityColorClass(rarity: string): string;
/**
 * Get rarity background color class for UI
 */
export declare function getRarityBgClass(rarity: string): string;
/**
 * Get rarity display name
 */
export declare function getRarityDisplayName(rarity: string): string;
