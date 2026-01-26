/**
 * Social Systems Types & Enums
 * Shared types, enums, and interfaces for Social Systems 1.0
 * v0.36.42 - Social Systems 1.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Social Activity Type
 */
export enum ActivityType {
  MISSION_COMPLETED = 'mission_completed',
  LEVEL_UP = 'level_up',
  MOUNT_UPGRADED = 'mount_upgraded',
  ITEM_CRAFTED = 'item_crafted',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  QUESTION_ANSWERED = 'question_answered',
  FIGHT_WON = 'fight_won',
  MARKETPLACE_SALE = 'marketplace_sale',
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Follow relationship
 */
export interface Follow {
  id: string;
  followerId: string;
  targetId: string;
  createdAt: Date;
  // Relations (populated)
  follower?: {
    id: string;
    username?: string | null;
    name?: string | null;
  };
  target?: {
    id: string;
    username?: string | null;
    name?: string | null;
  };
}

/**
 * Block relationship
 */
export interface Block {
  id: string;
  userId: string;
  blockedUserId: string;
  createdAt: Date;
  // Relations (populated)
  user?: {
    id: string;
    username?: string | null;
  };
  blockedUser?: {
    id: string;
    username?: string | null;
  };
}

/**
 * Social activity entry
 */
export interface SocialActivity {
  id: string;
  userId: string;
  type: ActivityType;
  refId?: string | null; // Reference to related entity (missionId, itemId, etc.)
  metadata?: Record<string, any> | null; // Additional data (JSON)
  timestamp: Date;
  // Relations (populated)
  user?: {
    id: string;
    username?: string | null;
    name?: string | null;
  };
}

/**
 * Compare data structure
 */
export interface CompareData {
  userA: {
    id: string;
    username?: string | null;
    name?: string | null;
    level: number;
    xp: number;
    mountStats?: {
      level: number;
      power: number;
      speed: number;
    } | null;
    recentMissions: Array<{
      id: string;
      title: string;
      completedAt: Date;
    }>;
    economyStats: {
      gold: number;
      diamonds: number;
      totalEarned: number;
    };
  };
  userB: {
    id: string;
    username?: string | null;
    name?: string | null;
    level: number;
    xp: number;
    mountStats?: {
      level: number;
      power: number;
      speed: number;
    } | null;
    recentMissions: Array<{
      id: string;
      title: string;
      completedAt: Date;
    }>;
    economyStats: {
      gold: number;
      diamonds: number;
      totalEarned: number;
    };
  };
}

/**
 * Social feed item
 */
export interface SocialFeedItem {
  id: string;
  userId: string;
  username?: string | null;
  name?: string | null;
  type: ActivityType;
  refId?: string | null;
  metadata?: Record<string, any> | null;
  timestamp: Date;
  displayText: string; // Formatted display text
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate activity type
 */
export function isValidActivityType(value: string): value is ActivityType {
  return Object.values(ActivityType).includes(value as ActivityType);
}

/**
 * Get activity type display name
 */
export function getActivityTypeDisplayName(type: ActivityType): string {
  const displayNames: Record<ActivityType, string> = {
    [ActivityType.MISSION_COMPLETED]: 'Completed Mission',
    [ActivityType.LEVEL_UP]: 'Leveled Up',
    [ActivityType.MOUNT_UPGRADED]: 'Upgraded Mount',
    [ActivityType.ITEM_CRAFTED]: 'Crafted Item',
    [ActivityType.ACHIEVEMENT_UNLOCKED]: 'Unlocked Achievement',
    [ActivityType.QUESTION_ANSWERED]: 'Answered Question',
    [ActivityType.FIGHT_WON]: 'Won Fight',
    [ActivityType.MARKETPLACE_SALE]: 'Sold Item',
  };
  return displayNames[type] || type;
}

/**
 * Format activity for display
 */
export function formatActivityDisplay(activity: SocialActivity, metadata?: Record<string, any>): string {
  const userName = activity.user?.name || activity.user?.username || 'Someone';
  
  switch (activity.type) {
    case ActivityType.MISSION_COMPLETED:
      return `${userName} completed a mission`;
    case ActivityType.LEVEL_UP:
      return `${userName} reached level ${metadata?.level || '?'}`;
    case ActivityType.MOUNT_UPGRADED:
      return `${userName} upgraded their mount`;
    case ActivityType.ITEM_CRAFTED:
      return `${userName} crafted ${metadata?.itemName || 'an item'}`;
    case ActivityType.ACHIEVEMENT_UNLOCKED:
      return `${userName} unlocked "${metadata?.achievementName || 'an achievement'}"`;
    case ActivityType.QUESTION_ANSWERED:
      return `${userName} answered a question`;
    case ActivityType.FIGHT_WON:
      return `${userName} won a fight`;
    case ActivityType.MARKETPLACE_SALE:
      return `${userName} sold ${metadata?.itemName || 'an item'}`;
    default:
      return `${userName} did something`;
  }
}

