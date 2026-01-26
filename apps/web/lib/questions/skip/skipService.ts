/**
 * Skip Question Service
 * Skip question functionality
 * v0.37.2 - Skip Question Feature
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { SkipResult } from './types';

/**
 * Skip a question for a user
 * 
 * @param userId - User ID
 * @param questionId - Question ID to skip
 * @returns Success result
 */
export async function skipQuestion(
  userId: string,
  questionId: string
): Promise<SkipResult> {
  try {
    // Validate question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Check if already skipped
    const existing = await prisma.skipQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existing) {
      // Already skipped, return success (idempotent)
      return { success: true };
    }

    // Create skip record
    await prisma.skipQuestion.create({
      data: {
        userId,
        questionId,
      },
    });

    logger.debug(`[SkipService] User ${userId} skipped question ${questionId}`);

    return { success: true };
  } catch (error) {
    logger.error('[SkipService] Failed to skip question', { userId, questionId, error });
    return { success: false, error: 'Failed to skip question' };
  }
}

/**
 * Check if a question is skipped by a user
 * 
 * @param userId - User ID
 * @param questionId - Question ID
 * @returns True if skipped
 */
export async function isQuestionSkipped(userId: string, questionId: string): Promise<boolean> {
  try {
    const skip = await prisma.skipQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    return !!skip;
  } catch (error) {
    logger.error('[SkipService] Failed to check skip status', { userId, questionId, error });
    return false;
  }
}

/**
 * Get skipped question IDs for a user
 * Useful for filtering skipped questions from feeds
 * 
 * @param userId - User ID
 * @returns Array of skipped question IDs
 */
export async function getSkippedQuestionIds(userId: string): Promise<string[]> {
  try {
    const skips = await prisma.skipQuestion.findMany({
      where: { userId },
      select: { questionId: true },
    });

    return skips.map(skip => skip.questionId);
  } catch (error) {
    logger.error('[SkipService] Failed to get skipped questions', { userId, error });
    return [];
  }
}

