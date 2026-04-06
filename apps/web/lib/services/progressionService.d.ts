/**
 * Progression Service
 * Handles XP, leveling, stat calculations, and archetype bonuses
 * v0.26.6 - Archetypes & Leveling
 */
export interface Stats {
    str: number;
    int: number;
    cha: number;
    luck: number;
}
/**
 * Get level from total XP (v0.36.34 - uses new level curve)
 */
export declare function getLevel(xp: number): number;
/**
 * Get XP required for next level (v0.36.34 - uses new level curve)
 */
export declare function getXPForNextLevel(currentLevel: number): number;
/**
 * Get XP progress for current level (uses level curve; single source of truth).
 */
export declare function getXPProgress(xp: number, level: number): {
    currentXP: number;
    requiredXP: number;
    progress: number;
};
/**
 * Add XP to user and handle level ups
 */
export declare function addXP(userId: string, amount: number, source?: string): Promise<{
    level: number;
    xp: number;
    leveledUp: boolean;
    newLevel?: number;
}>;
/**
 * Handle level up - update stats and notify
 * v0.36.2 - Uses updateHeroStats() for unified stat calculation
 */
export declare function handleLevelUp(userId: string, oldLevel: number, newLevel: number): Promise<void>;
/**
 * Select archetype for user
 */
export declare function selectArchetype(userId: string, archetypeKey: string): Promise<{
    success: boolean;
    stats: Stats;
}>;
/**
 * Reroll archetype (with cooldown and cost)
 */
export declare function rerollArchetype(userId: string): Promise<{
    success: boolean;
    costPaid: number;
    newStats: Stats;
    error?: string;
}>;
/**
 * Update hero stats - single source of truth for stat calculation
 * Calculates: base stats (from archetype) + level bonuses + equipment bonuses
 * v0.36.2 - Hero stats recalculation pipeline
 */
export declare function updateHeroStats(userId: string): Promise<Stats>;
/**
 * Get user stats (with archetype bonuses applied)
 */
export declare function getUserStats(userId: string): Promise<{
    stats: Stats | null;
    archetype: string | null;
    level: number;
    xp: number;
    xpProgress: ReturnType<typeof getXPProgress>;
}>;
