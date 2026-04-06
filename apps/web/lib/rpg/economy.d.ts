/**
 * Economy Pricing System
 * Defines item pricing formulas and gold management
 * v0.36.14 - Economy Sanity Pass
 */
export declare const BASE_PRICE: Record<string, number>;
export declare const STAT_VALUE: Record<string, number>;
export interface ItemStats {
    rarity: string;
    hp?: number;
    atk?: number;
    def?: number;
    crit?: number;
    speed?: number;
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
export declare function calculateItemPrice(item: ItemStats): number;
