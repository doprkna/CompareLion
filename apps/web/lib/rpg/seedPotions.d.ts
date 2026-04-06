/**
 * Seed Potions (Consumables)
 * v0.36.14 - Economy Sanity Pass
 */
export interface PotionSeed {
    key: string;
    name: string;
    emoji: string;
    description: string;
    rarity: string;
    type: string;
    goldPrice: number;
    hpRestore?: number;
    atkBonus?: number;
}
/**
 * Seed potions into the database
 * Uses upsert to avoid duplicates
 */
export declare function seedPotions(): Promise<number>;
