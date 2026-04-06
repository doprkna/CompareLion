/**
 * Social Systems Types & Enums
 * Shared types, enums, and interfaces for Social Systems 1.0
 * v0.36.42 - Social Systems 1.0
 */
/**
 * Social Activity Type
 */
export declare enum ActivityType {
    MISSION_COMPLETED = "mission_completed",
    LEVEL_UP = "level_up",
    MOUNT_UPGRADED = "mount_upgraded",
    ITEM_CRAFTED = "item_crafted",
    ACHIEVEMENT_UNLOCKED = "achievement_unlocked",
    QUESTION_ANSWERED = "question_answered",
    FIGHT_WON = "fight_won",
    MARKETPLACE_SALE = "marketplace_sale"
}
/**
 * Follow relationship
 */
export interface Follow {
    id: string;
    followerId: string;
    targetId: string;
    createdAt: Date;
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
    refId?: string | null;
    metadata?: Record<string, any> | null;
    timestamp: Date;
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
    displayText: string;
}
/**
 * Validate activity type
 */
export declare function isValidActivityType(value: string): value is ActivityType;
/**
 * Get activity type display name
 */
export declare function getActivityTypeDisplayName(type: ActivityType): string;
/**
 * Format activity for display
 */
export declare function formatActivityDisplay(activity: SocialActivity, metadata?: Record<string, any>): string;
