/**
 * Mission Engine
 * Generic objective processor, auto-assignment, and reset logic
 * v0.36.36 - Missions & Quests 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  MissionType,
  ObjectiveType,
  Mission,
  MissionProgress,
  MissionWithProgress,
  isValidObjectiveType,
  calculateProgressPercent,
} from './types';

/**
 * Increment mission progress for a user
 * Called by combat, questions, crafting, etc. when objectives are completed
 * 
 * @param userId - User ID
 * @param objectiveType - Type of objective (kill_enemies, answer_questions, etc.)
 * @param amount - Amount to increment (default: 1)
 */
export async function incrementMissionProgress(
  userId: string,
  objectiveType: ObjectiveType | string,
  amount: number = 1
): Promise<void> {
  try {
    if (!isValidObjectiveType(objectiveType)) {
      logger.debug(`[MissionEngine] Invalid objective type: ${objectiveType}`);
      return;
    }

    // Get all active missions for this user that match the objective type
    // Note: This will work once Mission and MissionProgress models exist
    // For now, this is a stub that will be implemented after Prisma models are added
    
    logger.info(`[MissionEngine] Incrementing progress`, {
      userId,
      objectiveType,
      amount,
    });

    // TODO: Implement once Mission model exists:
    // 1. Find all active missions matching objectiveType
    // 2. Find user's progress for those missions
    // 3. Increment progress
    // 4. Check for completion and trigger rewards if needed

  } catch (error) {
    logger.error('[MissionEngine] Failed to increment progress', {
      userId,
      objectiveType,
      amount,
      error,
    });
  }
}

/**
 * Assign missions to a user
 * Auto-assigns daily/weekly missions based on active mission templates
 * 
 * @param userId - User ID
 * @param type - Mission type (daily/weekly)
 */
export async function assignMissions(
  userId: string,
  type: MissionType.DAILY | MissionType.WEEKLY
): Promise<MissionProgress[]> {
  try {
    // TODO: Implement once Mission model exists:
    // 1. Get all active missions of the specified type
    // 2. Filter out missions user already has progress for (unless repeatable)
    // 3. Create MissionProgress records for new assignments
    // 4. Return assigned missions

    logger.info(`[MissionEngine] Assigning ${type} missions`, { userId });
    return [];

  } catch (error) {
    logger.error('[MissionEngine] Failed to assign missions', {
      userId,
      type,
      error,
    });
    return [];
  }
}

/**
 * Reset missions for all users
 * Called by cron job at midnight (daily) or Monday (weekly)
 * 
 * @param type - Mission type to reset
 */
export async function resetMissions(type: MissionType.DAILY | MissionType.WEEKLY): Promise<number> {
  try {
    // TODO: Implement once MissionProgress model exists:
    // 1. Find all MissionProgress records of the specified type
    // 2. Reset currentValue to 0, completed to false, claimed to false
    // 3. Update assignedAt timestamp
    // 4. Return count of reset missions

    logger.info(`[MissionEngine] Resetting ${type} missions`);
    return 0;

  } catch (error) {
    logger.error('[MissionEngine] Failed to reset missions', { type, error });
    return 0;
  }
}

/**
 * Get week start (Monday 00:00:00)
 */
export function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

/**
 * Get day start (today 00:00:00)
 */
export function getDayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if daily reset is needed
 */
export function needsDailyReset(lastReset: Date | null): boolean {
  if (!lastReset) return true;
  const today = getDayStart();
  return lastReset < today;
}

/**
 * Check if weekly reset is needed
 */
export function needsWeeklyReset(lastReset: Date | null): boolean {
  if (!lastReset) return true;
  const weekStart = getWeekStart();
  return lastReset < weekStart;
}

