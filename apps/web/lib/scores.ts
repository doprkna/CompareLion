/**
 * User Scores Update Utility
 * 
 * Centralized function to recalculate both karma and prestige.
 * Called after significant user actions.
 */

import { recalculatePrestige } from "./prestige";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

/**
 * Recalculate and update all user scores
 * @param userId User ID
 * @returns Object with updated karma and prestige scores
 */
export async function updateUserScores(userId: string): Promise<{ karma: number; prestige: number }> {
  // Recalculate prestige (based on level, achievements, etc.)
  const prestige = await recalculatePrestige(userId);
  
  // Get current karma (it's updated incrementally, not recalculated)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { karmaScore: true },
  });

  const karma = user?.karmaScore || 0;


  return { karma, prestige };
}

/**
 * Batch update scores for multiple users
 * @param userIds Array of user IDs
 */
export async function batchUpdateScores(userIds: string[]): Promise<void> {
  
  for (const userId of userIds) {
    try {
      await updateUserScores(userId);
    } catch (error) {
      logger.error('[Scores] Failed to update user', { userId, error });
    }
  }
  
}













