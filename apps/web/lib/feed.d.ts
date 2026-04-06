/**
 * Global Feed System
 *
 * Helper functions for creating and managing community feed events.
 */
export interface FeedItemData {
    type: string;
    title: string;
    description?: string;
    userId: string;
    metadata?: any;
}
/**
 * Create a new global feed item
 */
export declare function createFeedItem(data: FeedItemData): Promise<any>;
/**
 * Log achievement unlock to feed
 */
export declare function logAchievementToFeed(userId: string, achievementTitle: string, achievementIcon: string, xpReward: number): Promise<any>;
/**
 * Log challenge completion to feed
 */
export declare function logChallengeToFeed(userId: string, challengeType: string, wasAccepted: boolean): Promise<any>;
/**
 * Log quiz/flow completion to feed
 */
export declare function logQuizToFeed(userId: string, categoryName: string, correctAnswers: number, totalQuestions: number): Promise<any>;
/**
 * Log duel result to feed
 */
export declare function logDuelToFeed(userId: string, opponentName: string, won: boolean, score?: string): Promise<any>;
/**
 * Log group join to feed
 */
export declare function logGroupJoinToFeed(userId: string, groupName: string, groupEmblem: string): Promise<any>;
/**
 * Log level up to feed
 */
export declare function logLevelUpToFeed(userId: string, newLevel: number, archetype?: string): Promise<any>;
/**
 * Add reaction to feed item
 */
export declare function addFeedReaction(feedItemId: string, userId: string, emoji: string): Promise<any>;
/**
 * Remove reaction from feed item
 */
export declare function removeFeedReaction(feedItemId: string, userId: string): Promise<void>;
/**
 * Get trending feed items (most reactions in last 24h)
 */
export declare function getTrendingFeedItems(limit?: number): Promise<any>;
/**
 * Get feed items from friends
 */
export declare function getFriendsFeedItems(userId: string, limit?: number): Promise<any>;
