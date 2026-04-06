/**
 * Skip Question Service
 * Skip question functionality
 * v0.37.2 - Skip Question Feature
 */
import { SkipResult } from './types';
/**
 * Skip a question for a user
 *
 * @param userId - User ID
 * @param questionId - Question ID to skip
 * @returns Success result
 */
export declare function skipQuestion(userId: string, questionId: string): Promise<SkipResult>;
/**
 * Check if a question is skipped by a user
 *
 * @param userId - User ID
 * @param questionId - Question ID
 * @returns True if skipped
 */
export declare function isQuestionSkipped(userId: string, questionId: string): Promise<boolean>;
/**
 * Get skipped question IDs for a user
 * Useful for filtering skipped questions from feeds
 *
 * @param userId - User ID
 * @returns Array of skipped question IDs
 */
export declare function getSkippedQuestionIds(userId: string): Promise<string[]>;
