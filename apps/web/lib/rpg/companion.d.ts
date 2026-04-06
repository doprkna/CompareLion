/**
 * Companion System
 * Passive buffs from pets and companions
 * v0.36.17 - Companions + Pets System v0.1
 */
export interface CompanionBonuses {
    atkBonus: number;
    defBonus: number;
    hpBonus: number;
    critBonus: number;
    speedBonus: number;
    xpBonus: number;
    goldBonus: number;
}
/**
 * Get equipped companion bonuses for user
 * Returns zero bonuses if no companion equipped
 * v0.36.32 - Updated to support new Pet/UserPet system
 */
export declare function getEquippedCompanionBonuses(userId: string): Promise<CompanionBonuses>;
/**
 * Equip a companion
 * Unequips any currently equipped companion automatically
 */
export declare function equipCompanion(userId: string, userCompanionId: string): Promise<void>;
/**
 * Unequip companion
 */
export declare function unequipCompanion(userId: string): Promise<void>;
/**
 * Grant XP to companion (20% of hero XP)
 * Handles leveling up automatically
 */
export declare function grantCompanionXP(userId: string, heroXpGained: number): Promise<void>;
