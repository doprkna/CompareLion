/**
 * Poll Question Service
 * Create polls, handle votes, and get results
 * v0.37.4 - Poll Option Feature
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { PollOption, PollResults } from './types';

/**
 * Create poll options for a question
 * 
 * @param questionId - Question ID
 * @param options - Array of option texts
 * @returns Success result
 */
export async function createPoll(
  questionId: string,
  options: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Create poll options with IDs (A, B, C, ...)
    const pollOptions: PollOption[] = options.map((text, index) => ({
      id: String.fromCharCode(65 + index), // A, B, C, ...
      text,
      votes: 0,
    }));

    // Update question to mark as poll
    await prisma.question.update({
      where: { id: questionId },
      data: {
        isPoll: true,
        pollOptions: pollOptions as any,
      },
    });

    logger.debug(`[PollService] Created poll for question ${questionId} with ${options.length} options`);

    return { success: true };
  } catch (error) {
    logger.error('[PollService] Failed to create poll', { questionId, error });
    return { success: false, error: 'Failed to create poll' };
  }
}

/**
 * Vote on a poll
 * User can vote once, changing vote is allowed (deletes old vote, creates new)
 * 
 * @param userId - User ID
 * @param questionId - Question ID
 * @param optionId - Option ID to vote for
 * @returns Success result
 */
export async function votePoll(
  userId: string,
  questionId: string,
  optionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate question exists and is a poll
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, isPoll: true, pollOptions: true },
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    if (!question.isPoll) {
      return { success: false, error: 'Question is not a poll' };
    }

    // Validate option exists
    const pollOptions = question.pollOptions as PollOption[] | null;
    if (!pollOptions || !pollOptions.some(opt => opt.id === optionId)) {
      return { success: false, error: 'Invalid option ID' };
    }

    // Check if user already voted
    const existingVote = await prisma.pollVote.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      if (existingVote) {
        // Delete old vote
        await tx.pollVote.delete({
          where: { id: existingVote.id },
        });
      }

      // Create new vote
      await tx.pollVote.create({
        data: {
          userId,
          questionId,
          optionId,
        },
      });
    });

    logger.debug(`[PollService] User ${userId} voted ${optionId} on question ${questionId}`);

    return { success: true };
  } catch (error) {
    logger.error('[PollService] Failed to vote on poll', { userId, questionId, optionId, error });
    return { success: false, error: 'Failed to vote on poll' };
  }
}

/**
 * Get poll results with vote counts
 * 
 * @param questionId - Question ID
 * @param userId - Optional user ID to check if user voted
 * @returns Poll results
 */
export async function getPollResults(
  questionId: string,
  userId?: string
): Promise<PollResults | null> {
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, isPoll: true, pollOptions: true },
    });

    if (!question || !question.isPoll) {
      return null;
    }

    const pollOptions = question.pollOptions as PollOption[] | null;
    if (!pollOptions) {
      return null;
    }

    // Get vote counts per option
    const voteCounts = await prisma.pollVote.groupBy({
      by: ['optionId'],
      where: { questionId },
      _count: {
        optionId: true,
      },
    });

    // Create vote count map
    const voteMap = new Map<string, number>();
    voteCounts.forEach(v => {
      voteMap.set(v.optionId, v._count.optionId);
    });

    // Update poll options with vote counts
    const optionsWithVotes: PollOption[] = pollOptions.map(opt => ({
      ...opt,
      votes: voteMap.get(opt.id) || 0,
    }));

    // Get user's vote if userId provided
    let userVote: string | null = null;
    if (userId) {
      const userVoteRecord = await prisma.pollVote.findUnique({
        where: {
          userId_questionId: {
            userId,
            questionId,
          },
        },
        select: { optionId: true },
      });
      userVote = userVoteRecord?.optionId || null;
    }

    const totalVotes = optionsWithVotes.reduce((sum, opt) => sum + opt.votes, 0);

    return {
      questionId,
      options: optionsWithVotes,
      totalVotes,
      userVote,
    };
  } catch (error) {
    logger.error('[PollService] Failed to get poll results', { questionId, error });
    return null;
  }
}

