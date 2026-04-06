/**
 * AURE Interaction Engine - Adaptive Quest Generator
 * Generates personalized quests based on archetype and behavior
 * v0.39.6 - Intelligent Quests
 */
export type QuestType = 'upload' | 'rate' | 'vs' | 'assist' | 'mix' | 'vibe';
export type QuestFrequency = 'daily' | 'weekly';
export interface GeneratedQuest {
    id: string;
    type: QuestType;
    description: string;
    rewardXp: number;
    frequency: QuestFrequency;
    required: number;
}
/**
 * Generate adaptive quests for user
 * Based on archetype + recent behavior
 */
export declare function generateQuestsForUser(userId: string, frequency: QuestFrequency): Promise<GeneratedQuest[]>;
/**
 * Check if quests need refresh
 * Returns true if no quests exist or if they're older than threshold
 */
export declare function shouldRefreshQuests(userId: string, frequency: QuestFrequency): Promise<boolean>;
