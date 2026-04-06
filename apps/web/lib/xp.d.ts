/**
 * XP and Level System Utilities
 *
 * Formula:
 * - Level = floor(sqrt(XP / 100)) + 1
 * - XP required for level N = N^2 * 100
 *
 * Examples:
 * - Level 1: 0-99 XP
 * - Level 2: 100-399 XP
 * - Level 3: 400-899 XP
 * - Level 4: 900-1599 XP
 * - Level 5: 1600-2499 XP
 * - Level 10: 8100-10099 XP
 */
/**
 * Calculate user level from total XP
 * @param xp Total XP earned
 * @returns Current level (minimum 1)
 */
export declare function xpToLevel(xp: number): number;
/**
 * Calculate XP required to reach a specific level
 * @param level Target level
 * @returns Total XP needed to reach that level
 */
export declare function nextLevelXp(level: number): number;
/**
 * Calculate progress percentage toward next level
 * @param xp Current XP
 * @returns Progress percentage (0-100)
 */
export declare function levelProgress(xp: number): number;
/**
 * Get XP needed to reach next level
 * @param xp Current XP
 * @returns XP remaining until next level
 */
export declare function xpToNextLevel(xp: number): number;
/**
 * Get level range information
 * @param level Target level
 * @returns Object with min and max XP for that level
 */
export declare function getLevelRange(level: number): {
    min: number;
    max: number;
};
