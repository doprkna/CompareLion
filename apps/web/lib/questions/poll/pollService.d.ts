/**
 * Poll Question Service
 * Create polls, handle votes, and get results
 * v0.37.4 - Poll Option Feature
 */
import { PollResults } from './types';
/**
 * Create poll options for a question
 *
 * @param questionId - Question ID
 * @param options - Array of option texts
 * @returns Success result
 */
export declare function createPoll(questionId: string, options: string[]): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Vote on a poll
 * User can vote once, changing vote is allowed (deletes old vote, creates new)
 *
 * @param userId - User ID
 * @param questionId - Question ID
 * @param optionId - Option ID to vote for
 * @returns Success result
 */
export declare function votePoll(userId: string, questionId: string, optionId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Get poll results with vote counts
 *
 * @param questionId - Question ID
 * @param userId - Optional user ID to check if user voted
 * @returns Poll results
 */
export declare function getPollResults(questionId: string, userId?: string): Promise<PollResults | null>;
