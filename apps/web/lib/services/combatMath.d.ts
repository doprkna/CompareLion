/**
 * Combat Math - Stat-based combat calculations
 * v0.26.10 - Stat Influence & Combat Scaling
 *
 * Handles damage, crit, dodge, HP, and healing calculations using user stats
 */
export interface UserStats {
    str?: number;
    int?: number;
    dex?: number;
    vit?: number;
    luck?: number;
    cha?: number;
}
export interface CombatMathResult {
    damage: number;
    isCrit: boolean;
    critMultiplier: number;
    message?: string;
}
export interface DodgeResult {
    dodged: boolean;
    message?: string;
}
/**
 * Calculate total damage with all modifiers
 *
 * Formula: (baseDamage + STR bonus + item power) * crit multiplier (if crit)
 */
export declare function calculateStatBasedDamage(stats: UserStats, itemPower?: number, itemDamageMult?: number, itemCritChance?: number): CombatMathResult;
/**
 * Calculate dodge chance from DEX stat
 * Clamped between 0% and 35%
 */
export declare function calculateDodgeChance(dex?: number): number;
/**
 * Check if attack is dodged
 */
export declare function checkDodge(dex?: number): DodgeResult;
/**
 * Calculate hero max HP from VIT stat
 * Formula: baseHP + VIT * 10
 */
export declare function calculateMaxHP(baseHP: number, vit?: number): number;
/**
 * Calculate healing from rest using VIT stat
 * Formula: baseHeal + VIT * 0.5
 */
export declare function calculateRestHeal(baseHeal: number, vit?: number): number;
/**
 * Calculate HP regen per turn from VIT stat
 * Formula: VIT * 0.2
 */
export declare function calculateRegenPerTurn(vit?: number): number;
/**
 * Calculate XP bonus multiplier from INT stat
 * Formula: 1 + INT * 0.02
 */
export declare function calculateXPBonus(int?: number): number;
/**
 * Calculate gold bonus multiplier from CHA stat
 * Formula: 1 + CHA * 0.015
 */
export declare function calculateGoldBonus(cha?: number): number;
/**
 * Get stat summary for debugging/UI display
 */
export declare function getStatSummary(stats: UserStats): {
    damageBonus: number;
    critChance: number;
    critMultiplier: number;
    dodgeChance: number;
    hpBonus: number;
    xpBonus: number;
    goldBonus: number;
};
