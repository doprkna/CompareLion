/**
 * Final Stats Calculator
 * Unified stat system with base attributes and derived stats
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */
export interface BaseAttributes {
    strength: number;
    agility: number;
    endurance: number;
    intellect: number;
    luck: number;
}
export interface FinalStats {
    baseAttributes: BaseAttributes;
    maxHP: number;
    attack: number;
    defense: number;
    speed: number;
    critChance: number;
    critDamage: number;
    lootLuck: number;
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
export declare function calculateFinalStats(userId: string): Promise<FinalStats>;
