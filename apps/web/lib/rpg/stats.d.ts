/**
 * Canonical Stat Engine
 * Single source of truth for hero stat calculation
 * v0.36.11 - Character Sheet Overhaul
 */
export interface ComputedStats {
    level: number;
    xp: number;
    maxHp: number;
    attackPower: number;
    defense: number;
    critChance: number;
    speed: number;
    equipment: Array<{
        id: string;
        name: string;
        type: string;
        rarity: string;
        power: number;
        defense: number | null;
    }>;
    xpBonus?: number;
    goldBonus?: number;
}
/**
 * Compute hero stats - canonical stat engine
 * Unifies base stats, level scaling, and equipment modifiers
 * v0.36.34 - Now uses calculateFinalStats internally
 */
export declare function computeHeroStats(userId: string): Promise<ComputedStats>;
