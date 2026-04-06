/**
 * AI-Based Question Generation System (v0.8.0)
 *
 * PLACEHOLDER: Future implementation for automated content creation.
 *
 * This module will provide:
 * - Weighted category selection based on player engagement
 * - Real-time quality scoring
 * - Automatic retries for low-quality outputs
 * - Moderator feedback integration
 */
/**
 * Calculate category participation weight (0.0-1.0)
 * Higher weight = more popular/needed category
 *
 * PLACEHOLDER: Returns mock weight
 */
export declare function calculateCategoryWeight(categoryId: string): Promise<number>;
/**
 * Generate weighted questions for active categories
 *
 * PLACEHOLDER: Returns mock job
 */
export declare function generateWeightedQuestions(): Promise<{
    jobCount: number;
}>;
/**
 * Score AI-generated question quality (0.0-1.0)
 *
 * PLACEHOLDER: Returns mock score
 */
export declare function scoreQuestionQuality(questionText: string, options: string[]): Promise<number>;
/**
 * Submit moderator feedback on generated question
 *
 * PLACEHOLDER: Stores feedback
 */
export declare function submitModeratorFeedback(jobId: string, moderatorId: string, status: "approved" | "rejected" | "revised", score: number, notes?: string): Promise<void>;
/**
 * Get pending moderation jobs
 *
 * PLACEHOLDER: Returns jobs awaiting review
 */
export declare function getPendingModerationJobs(limit?: number): Promise<any>;
/**
 * Retry failed or low-quality job
 *
 * PLACEHOLDER: Marks job for retry
 */
export declare function retryGenerationJob(jobId: string): Promise<void>;
