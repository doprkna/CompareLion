/**
 * Answer Vote Service
 * Handle upvote/downvote on answers (UserReflection)
 * v0.37.11 - Upvote / Downvote Answers
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface VoteResult {
  success: boolean;
  score: number;
  userVote: 1 | -1 | null;
  error?: string;
}

/**
 * Vote on an answer (UserReflection)
 * If user clicks the same vote again, it removes the vote (toggles off)
 * 
 * @param userId - User ID
 * @param answerId - UserReflection ID
 * @param value - Vote value: 1 (upvote) or -1 (downvote)
 * @returns Vote result with score and user vote state
 */
export async function voteOnAnswer(
  userId: string,
  answerId: string,
  value: 1 | -1
): Promise<VoteResult> {
  try {
    // Verify answer exists
    const answer = await prisma.userReflection.findUnique({
      where: { id: answerId },
      select: { id: true },
    });

    if (!answer) {
      return {
        success: false,
        score: 0,
        userVote: null,
        error: 'Answer not found',
      };
    }

    // Check existing vote
    const existingVote = await prisma.answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote clicked - remove it (toggle off)
        await prisma.answerVote.delete({
          where: {
            answerId_userId: {
              answerId,
              userId,
            },
          },
        });
      } else {
        // Different vote - update
        await prisma.answerVote.update({
          where: {
            answerId_userId: {
              answerId,
              userId,
            },
          },
          data: { value },
        });
      }
    } else {
      // Create new vote
      await prisma.answerVote.create({
        data: {
          answerId,
          userId,
          value,
        },
      });
    }

    // Compute new score
    const score = await computeScore(answerId);

    // Get user's current vote
    const userVote = await prisma.answerVote.findUnique({
      where: {
        answerId_userId: {
          answerId,
          userId,
        },
      },
      select: { value: true },
    });

    return {
      success: true,
      score,
      userVote: (userVote?.value as 1 | -1) || null,
    };
  } catch (error) {
    logger.error('[VoteService] Failed to vote on answer', {
      userId,
      answerId,
      value,
      error,
    });

    return {
      success: false,
      score: 0,
      userVote: null,
      error: 'Failed to vote',
    };
  }
}

/**
 * Compute answer score (sum of all votes)
 * 
 * @param answerId - UserReflection ID
 * @returns Score (upvotes - downvotes)
 */
export async function computeScore(answerId: string): Promise<number> {
  try {
    const result = await prisma.answerVote.aggregate({
      where: { answerId },
      _sum: {
        value: true,
      },
    });

    return result._sum.value || 0;
  } catch (error) {
    logger.error('[VoteService] Failed to compute score', { answerId, error });
    return 0;
  }
}

/**
 * Get vote state for a user and answer
 * 
 * @param userId - User ID
 * @param answerId - UserReflection ID
 * @returns Vote state with score and user vote
 */
export async function getVoteState(
  userId: string,
  answerId: string
): Promise<{ score: number; userVote: 1 | -1 | null }> {
  try {
    const [score, userVote] = await Promise.all([
      computeScore(answerId),
      prisma.answerVote.findUnique({
        where: {
          answerId_userId: {
            answerId,
            userId,
          },
        },
        select: { value: true },
      }),
    ]);

    return {
      score,
      userVote: (userVote?.value as 1 | -1) || null,
    };
  } catch (error) {
    logger.error('[VoteService] Failed to get vote state', { userId, answerId, error });
    return {
      score: 0,
      userVote: null,
    };
  }
}

