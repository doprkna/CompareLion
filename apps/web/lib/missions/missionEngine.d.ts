/**
 * Mission Engine
 * Generic objective processor, auto-assignment, and reset logic
 * v0.36.36 - Missions & Quests 1.0
 */
import { MissionType, ObjectiveType, MissionProgress } from './types';
/**
 * Increment mission progress for a user
 * Called by combat, questions, crafting, etc. when objectives are completed
 *
 * @param userId - User ID
 * @param objectiveType - Type of objective (kill_enemies, answer_questions, etc.)
 * @param amount - Amount to increment (default: 1)
 */
export declare function incrementMissionProgress(userId: string, objectiveType: ObjectiveType | string, amount?: number): Promise<void>;
/**
 * Assign missions to a user
 * Auto-assigns daily/weekly missions based on active mission templates
 *
 * @param userId - User ID
 * @param type - Mission type (daily/weekly)
 */
export declare function assignMissions(userId: string, type: MissionType.DAILY | MissionType.WEEKLY): Promise<MissionProgress[]>;
/**
 * Reset missions for all users
 * Called by cron job at midnight (daily) or Monday (weekly)
 *
 * @param type - Mission type to reset
 */
export declare function resetMissions(type: MissionType.DAILY | MissionType.WEEKLY): Promise<number>;
/**
 * Get week start (Monday 00:00:00)
 */
export declare function getWeekStart(): Date;
/**
 * Get day start (today 00:00:00)
 */
export declare function getDayStart(): Date;
/**
 * Check if daily reset is needed
 */
export declare function needsDailyReset(lastReset: Date | null): boolean;
/**
 * Check if weekly reset is needed
 */
export declare function needsWeeklyReset(lastReset: Date | null): boolean;
