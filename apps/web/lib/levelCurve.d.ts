/**
 * Level Curve 2.0
 * New XP formula: XP(level) = 50 * level^1.5
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */
/**
 * Calculate XP required to reach a specific level
 * Formula: XP(level) = 50 * level^1.5
 *
 * Examples:
 * - Level 1: 50 XP
 * - Level 2: 141 XP
 * - Level 5: 559 XP
 * - Level 10: 1581 XP
 */
export declare function getXPForLevel(level: number): number;
/**
 * Calculate level from total XP (level we are currently in).
 * getXPForLevel(level) <= xp < getXPForLevel(level+1).
 */
export declare function getLevelFromXP(xp: number): number;
/**
 * Get XP required for next level
 */
export declare function getXPForNextLevel(currentLevel: number): number;
/**
 * Get XP progress for current level
 */
export declare function getXPProgress(xp: number, level: number): {
    currentXP: number;
    requiredXP: number;
    progress: number;
};
/**
 * Get XP needed to reach next level
 */
export declare function getXPToNextLevel(xp: number): number;
/**
 * Single helper: compute level progress from total XP.
 * Use for topbar, profile, and any UI that shows level %.
 */
export declare function computeLevelProgress(totalXp: number): {
    level: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    pct: number;
};
