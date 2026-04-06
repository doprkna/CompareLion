/**
 * Daily Quest System
 *
 * Dynamic rotating missions with rewards.
 */
export interface QuestTemplate {
    type: string;
    title: string;
    objective: string;
    targetCount: number;
    rewardXp: number;
    rewardGold: number;
    dropChance?: number;
}
/**
 * Generate daily quests (run via cron)
 */
export declare function generateDailyQuests(): Promise<void>;
/**
 * Get today's active quests
 */
export declare function getTodayQuests(): Promise<any>;
/**
 * Get user's quest progress
 */
export declare function getUserQuestProgress(userId: string): Promise<any>;
/**
 * Update quest progress
 */
export declare function updateQuestProgress(userId: string, questType: string, increment?: number): Promise<void>;
/**
 * Complete a quest and award rewards
 */
export declare function completeQuest(userId: string, questId: string): Promise<any>;
