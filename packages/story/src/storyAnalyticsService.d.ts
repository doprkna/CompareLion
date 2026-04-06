/**
 * Story Analytics Service
 * Lightweight creator analytics for stories
 * v0.40.12 - Story Analytics 1.0 (Views, Reactions, Engagement)
 */
export interface StoryReactionStats {
    like: number;
    lol: number;
    vibe: number;
}
export interface StoryStickerStat {
    id: string;
    emoji: string;
    count: number;
}
export interface StoryAnalytics {
    viewCount: number;
    reactions: StoryReactionStats;
    stickers: StoryStickerStat[];
    reachScore: number;
    inChallenges: string[];
}
/**
 * Increment story view count
 * Simple session-based tracking (no per-view logging in 1.0)
 */
export declare function incrementStoryView(storyId: string, userId?: string | null): Promise<number>;
/**
 * Get story reaction stats
 * Reuses existing getStoryReactionSummary
 */
export declare function getStoryReactionStats(storyId: string): Promise<StoryReactionStats>;
/**
 * Get story sticker stats
 * Returns top stickers sorted by count
 */
export declare function getStoryStickerStats(storyId: string): Promise<StoryStickerStat[]>;
/**
 * Get challenge IDs that this story is part of
 */
export declare function getStoryChallenges(storyId: string): Promise<string[]>;
/**
 * Calculate reach score for a story
 * Formula: viewCount + (reactions_total * 3) + (stickers_total * 2) + (isChallengeEntry ? 20 : 0)
 */
export declare function calculateStoryReachScore(storyId: string): Promise<number>;
/**
 * Get aggregated analytics for a story
 */
export declare function getStoryAnalytics(storyId: string): Promise<StoryAnalytics>;
