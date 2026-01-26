/**
 * Rarity Configuration
 * Defines rarity tiers, power ranges, and visual properties
 * v0.26.5 - Items 2.0: Rarity, Power & Effects
 */
export interface RarityDefinition {
    color: string;
    powerRange: [number, number];
    dropRate: number;
    rarityMultiplier: number;
}
export declare const RARITIES: Record<string, RarityDefinition>;
export type RarityKey = keyof typeof RARITIES;
/**
 * Get rarity definition by key
 */
export declare function getRarity(key: string): RarityDefinition;
/**
 * Generate random rarity based on drop rates
 */
export declare function rollRarity(): RarityKey;
/**
 * Generate random power within rarity range
 */
export declare function generatePowerForRarity(rarity: RarityKey): number;
