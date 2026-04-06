/**
 * AURE Interaction Engine - Quests Service 2.0
 * Manages adaptive daily/weekly quests with XP rewards
 * v0.39.6 - Intelligent Quests
 */
import { QuestType, QuestFrequency } from './questGenerator';
export type QuestType = 'upload' | 'rate' | 'vs' | 'coach' | 'mix' | 'vibe';
export interface Quest {
    id: string;
    type: QuestType;
    description: string;
    rewardXp: number;
    frequency: QuestFrequency;
    required?: number;
}
export interface QuestProgress {
    questId: string;
    progress: number;
    required: number;
    completedAt: Date | null;
    quest: Quest;
}
/**
 * Get active quests for a user
 * Returns daily + weekly quests with user progress
 * Auto-refreshes if needed
 */
export declare function getActiveQuests(userId: string): Promise<QuestProgress[]>;
/**
 * Refresh quests for user
 * Generates new quests and stores them
 */
export declare function refreshQuests(userId: string, frequency: QuestFrequency): Promise<void>;
/**
 * Increment quest progress by quest ID
 * New helper for explicit quest progress updates
 */
export declare function incrementQuestProgress(userId: string, questId: string, amount?: number): Promise<{
    success: boolean;
    completed: boolean;
}>;
/**
 * Increment quest progress by type (legacy helper)
 * Called when user performs quest-related actions
 */
export declare function incrementQuest(userId: string, questType: QuestType, amount?: number): Promise<void>;
/**
 * Complete a quest
 * Marks quest as completed and awards XP
 */
export declare function completeQuest(userId: string, questId: string): Promise<{
    success: boolean;
    xpAwarded: number;
}>;
