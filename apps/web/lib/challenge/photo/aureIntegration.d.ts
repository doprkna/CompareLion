/**
 * AURE Integration for Photo Challenge
 * Links PhotoChallengeEntry with RatingRequest and computes smart scores
 * v0.38.11 - Challenge Integration with AURE
 */
export interface ChallengeEntryScore {
    finalScore: number;
    humanScore: number;
    aiScore: number;
    hasAiRating: boolean;
    humanScoreNorm: number;
    aiScoreNorm: number;
}
/**
 * Ensure a rating exists for an entry
 * Creates RatingRequest if not found, then generates rating
 */
export declare function ensureEntryRating(entryId: string): Promise<string | null>;
/**
 * Get challenge entry score combining human votes and AI metrics
 */
export declare function getChallengeEntryScore(entryId: string): Promise<ChallengeEntryScore>;
