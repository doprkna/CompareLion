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
export function xpToLevel(xp: number): number {
  if (xp < 0) return 1;
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Calculate XP required to reach a specific level
 * @param level Target level
 * @returns Total XP needed to reach that level
 */
export function nextLevelXp(level: number): number {
  if (level <= 1) return 0;
  return ((level - 1) ** 2) * 100;
}

/**
 * Calculate progress percentage toward next level
 * @param xp Current XP
 * @returns Progress percentage (0-100)
 */
export function levelProgress(xp: number): number {
  const level = xpToLevel(xp);
  const currentLevelXp = nextLevelXp(level);
  const nextLevel = nextLevelXp(level + 1);
  
  if (nextLevel === currentLevelXp) return 100;
  
  const progress = ((xp - currentLevelXp) / (nextLevel - currentLevelXp)) * 100;
  return Math.max(0, Math.min(100, progress));
}

/**
 * Get XP needed to reach next level
 * @param xp Current XP
 * @returns XP remaining until next level
 */
export function xpToNextLevel(xp: number): number {
  const level = xpToLevel(xp);
  const nextLevel = nextLevelXp(level + 1);
  return nextLevel - xp;
}

/**
 * Get level range information
 * @param level Target level
 * @returns Object with min and max XP for that level
 */
export function getLevelRange(level: number): { min: number; max: number } {
  const min = nextLevelXp(level);
  const max = nextLevelXp(level + 1) - 1;
  return { min, max };
}













