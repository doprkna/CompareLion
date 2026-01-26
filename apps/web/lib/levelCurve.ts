/**
 * Level Curve 2.0
 * New XP formula: XP(level) = 50 * level^1.5
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */

const MAX_LEVEL = 100; // Cap to prevent overflow

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
export function getXPForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return getXPForLevel(MAX_LEVEL);
  return Math.floor(50 * Math.pow(level, 1.5));
}

/**
 * Calculate level from total XP
 * Inverse of getXPForLevel: level = (XP / 50)^(2/3)
 */
export function getLevelFromXP(xp: number): number {
  if (xp < 0) return 1;
  if (xp < 50) return 1; // Level 1 requires 0 XP
  
  // Solve: xp = 50 * level^1.5
  // level^1.5 = xp / 50
  // level = (xp / 50)^(2/3)
  const level = Math.floor(Math.pow(xp / 50, 2/3)) + 1;
  return Math.min(level, MAX_LEVEL);
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) {
    return 0; // Max level reached
  }
  return getXPForLevel(currentLevel + 1);
}

/**
 * Get XP progress for current level
 */
export function getXPProgress(xp: number, level: number): {
  currentXP: number;
  requiredXP: number;
  progress: number; // 0-1
} {
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const requiredXP = nextLevelXP - currentLevelXP;
  const currentXP = xp - currentLevelXP;
  const progress = requiredXP > 0 ? currentXP / requiredXP : 1;
  
  return {
    currentXP: Math.max(0, currentXP),
    requiredXP,
    progress: Math.min(1, Math.max(0, progress)),
  };
}

/**
 * Get XP needed to reach next level
 */
export function getXPToNextLevel(xp: number): number {
  const level = getLevelFromXP(xp);
  const nextLevelXP = getXPForLevel(level + 1);
  return Math.max(0, nextLevelXP - xp);
}

