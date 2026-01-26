/**
 * Seasons & Battlepass Types & Enums
 * Shared types, enums, and interfaces for Seasons & Battlepass system
 * v0.36.38 - Seasons & Battlepass 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Battlepass Track Type
 */
export enum BattlepassTrack {
  FREE = 'free',
  PREMIUM = 'premium',
}

/**
 * Reward Type - What kind of reward is granted
 */
export enum RewardType {
  GOLD = 'gold',
  DIAMONDS = 'diamonds',
  XP = 'xp',
  ITEM = 'item',
  COMPANION = 'companion',
  THEME = 'theme',
  XP_BOOST = 'xp-boost',
  COSMETIC = 'cosmetic',
  PERK = 'perk',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Battlepass reward structure
 */
export interface BattlepassReward {
  type: RewardType;
  amount?: number;
  itemId?: string;
  companionId?: string;
  themeId?: string;
  cosmeticId?: string;
  perkId?: string;
  quantity?: number;
  // Metadata for display
  name?: string;
  description?: string;
  icon?: string;
}

/**
 * Battlepass tier definition
 */
export interface BattlepassTier {
  level: number;
  xpRequired: number;
  freeReward?: BattlepassReward | null;
  premiumReward?: BattlepassReward | null;
}

/**
 * Season definition
 */
export interface Season {
  id: string;
  name: string;
  seasonNumber: number;
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
  premiumPrice?: number | null;
  description?: string | null;
  theme?: string | null;
}

/**
 * User battlepass progress
 */
export interface UserBattlepassProgress {
  id: string;
  userId: string;
  seasonId: string;
  xp: number;
  currentLevel: number;
  premiumActive: boolean;
  claimedRewards: number[]; // Array of tier levels that have been claimed
  unlockedLevels: number[]; // Array of tier levels that are unlocked (calculated)
}

/**
 * Full battlepass progress (for API responses)
 */
export interface BattlepassProgress {
  season: Season;
  tiers: BattlepassTier[];
  userProgress: {
    xp: number;
    currentLevel: number;
    premiumActive: boolean;
    claimedRewards: number[];
    unlockedLevels: number[];
    progressToNextLevel?: {
      currentXP: number;
      requiredXP: number;
      percent: number;
    };
  };
}

/**
 * Season summary (for rollover)
 */
export interface SeasonSummary {
  seasonId: string;
  seasonNumber: number;
  totalUsers: number;
  totalXP: number;
  averageLevel: number;
  maxLevel: number;
  premiumUsers: number;
  totalRewardsClaimed: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate XP required for a level
 * Simple formula: level * baseXP
 * 
 * @param level - Target level
 * @param baseXP - Base XP per level (default: 100)
 */
export function calculateLevelXP(level: number, baseXP: number = 100): number {
  return level * baseXP;
}

/**
 * Calculate level from total XP
 * 
 * @param totalXP - Total XP accumulated
 * @param baseXP - Base XP per level (default: 100)
 */
export function calculateLevelFromXP(totalXP: number, baseXP: number = 100): number {
  if (totalXP <= 0) return 0;
  return Math.floor(totalXP / baseXP);
}

/**
 * Calculate progress to next level
 * 
 * @param currentXP - Current total XP
 * @param baseXP - Base XP per level (default: 100)
 */
export function calculateProgressToNextLevel(
  currentXP: number,
  baseXP: number = 100
): { currentXP: number; requiredXP: number; percent: number } {
  const currentLevel = calculateLevelFromXP(currentXP, baseXP);
  const currentLevelXP = currentLevel * baseXP;
  const nextLevelXP = (currentLevel + 1) * baseXP;
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForNext = nextLevelXP - currentXP;
  const percent = (xpInCurrentLevel / baseXP) * 100;

  return {
    currentXP: xpInCurrentLevel,
    requiredXP: baseXP,
    percent: Math.min(100, Math.max(0, percent)),
  };
}

/**
 * Check if season is active
 */
export function isSeasonActive(season: Season): boolean {
  const now = new Date();
  return (
    season.isActive &&
    season.startsAt <= now &&
    season.endsAt >= now
  );
}

/**
 * Get days remaining in season
 */
export function getDaysRemaining(season: Season): number {
  const now = new Date();
  const end = new Date(season.endsAt);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Validate reward type
 */
export function isValidRewardType(value: string): value is RewardType {
  return Object.values(RewardType).includes(value as RewardType);
}

/**
 * Get reward type display name
 */
export function getRewardTypeDisplayName(type: RewardType): string {
  const displayNames: Record<RewardType, string> = {
    [RewardType.GOLD]: 'Gold',
    [RewardType.DIAMONDS]: 'Diamonds',
    [RewardType.XP]: 'XP',
    [RewardType.ITEM]: 'Item',
    [RewardType.COMPANION]: 'Companion',
    [RewardType.THEME]: 'Theme',
    [RewardType.XP_BOOST]: 'XP Boost',
    [RewardType.COSMETIC]: 'Cosmetic',
    [RewardType.PERK]: 'Perk',
  };
  return displayNames[type] || type;
}

