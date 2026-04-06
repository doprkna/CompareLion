/**
 * Answer Vote Service
 * Handle upvote/downvote on answers (UserReflection)
 * v0.37.11 - Upvote / Downvote Answers
 */
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
export declare function voteOnAnswer(userId: string, answerId: string, value: 1 | -1): Promise<VoteResult>;
/**
 * Compute answer score (sum of all votes)
 *
 * @param answerId - UserReflection ID
 * @returns Score (upvotes - downvotes)
 */
export declare function computeScore(answerId: string): Promise<number>;
/**
 * Get vote state for a user and answer
 *
 * @param userId - User ID
 * @param answerId - UserReflection ID
 * @returns Vote state with score and user vote
 */
export declare function getVoteState(userId: string, answerId: string): Promise<{
    score: number;
    userVote: 1 | -1 | null;
}>;
