/**
 * Story Ranking Service
 * Compute ranking scores for story feed
 * v0.40.16 - Story Feed Ranking 1.0 (Simple Sorting Logic)
 */
export interface StoryRankingData {
    id: string;
    createdAt: Date;
    viewCount: number;
    reactions: {
        like: number;
        lol: number;
        vibe: number;
    };
    stickers: Array<{
        count: number;
    }>;
    inChallenges: string[];
    activeChallenges?: string[];
}
/**
 * Compute story rank score
 * Formula: recentness + (reactionTotal * 2) + (stickerTotal) + challengeBoost
 */
export declare function computeStoryRankScore(story: StoryRankingData, activeChallengeIds?: string[]): number;
/**
 * Get active challenge IDs (challenges that are currently active)
 * Cached for 5 minutes to reduce database load
 */
export declare function getActiveChallengeIds(): Promise<string[]>;
