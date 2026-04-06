/**
 * Feed Service
 * Generates feed posts from game actions
 * v0.36.25 - Community Feed 1.0
 */
export type FeedPostType = 'achievement' | 'fight' | 'question' | 'levelup' | 'loot' | 'status' | 'milestone';
interface CreateFeedPostParams {
    userId: string;
    type: FeedPostType;
    content?: string;
    refId?: string;
    visibility?: string;
}
/**
 * Create a feed post
 */
export declare function createFeedPost(params: CreateFeedPostParams): Promise<string>;
/**
 * Post when user answers a question
 */
export declare function postQuestionAnswered(userId: string, questionId: string): Promise<void>;
/**
 * Post when user finishes 5 questions (milestone)
 */
export declare function postQuestionMilestone(userId: string, count: number): Promise<void>;
/**
 * Post when user wins a fight
 */
export declare function postFightWin(userId: string, fightId: string, enemyName: string): Promise<void>;
/**
 * Post when user loses a fight
 */
export declare function postFightLoss(userId: string, fightId: string, enemyName: string): Promise<void>;
/**
 * Post when user loots an item
 */
export declare function postLoot(userId: string, itemId: string, itemName: string, rarity: string): Promise<void>;
/**
 * Post when user levels up
 */
export declare function postLevelUp(userId: string, newLevel: number): Promise<void>;
/**
 * Post when user unlocks an achievement
 */
export declare function postAchievement(userId: string, achievementId: string, achievementTitle: string): Promise<void>;
/**
 * Post when user updates status message
 */
export declare function postStatusUpdate(userId: string, statusMessage: string): Promise<void>;
/**
 * Create ComparePost when user answers a question (v0.36.31)
 */
export declare function createComparePostFromAnswer(userId: string, questionId: string, answer: string, value?: number | string | object): Promise<void>;
export {};
