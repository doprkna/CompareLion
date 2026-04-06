/**
 * AI Universal Rating Service
 * Generate ratings for user-submitted content
 * v0.38.1 - AI Universal Rating Engine
 */
export interface RatingMetrics {
    [key: string]: number;
}
export interface RatingResult {
    metrics: RatingMetrics;
    summaryText: string;
    roastText: string;
}
/**
 * Generate universal rating for a request
 * Stub implementation - returns placeholder ratings for now
 *
 * @param requestId - Rating request ID
 * @returns Rating result with metrics, summary, and roast
 */
export declare function generateUniversalRating(requestId: string): Promise<RatingResult>;
/**
 * Create rating request
 *
 * @param userId - User ID
 * @param category - Category preset name
 * @param imageUrl - Optional image URL
 * @param text - Optional text content
 * @returns Created rating request
 */
export declare function createRatingRequest(userId: string, category: string, imageUrl?: string, text?: string): Promise<{
    id: string;
}>;
/**
 * Get rating result for a request
 * Generates rating if not already created
 *
 * @param requestId - Rating request ID
 * @returns Rating result
 */
export declare function getRatingResult(requestId: string): Promise<RatingResult>;
export interface ComparisonData {
    userScore: RatingMetrics;
    avgScore: RatingMetrics;
    percentiles: RatingMetrics;
    topEntries: Array<{
        requestId: string;
        imageUrl: string | null;
        metrics: RatingMetrics;
        totalScore: number;
    }>;
}
/**
 * Get comparison data for a rating result
 * Compares user's item to category average, percentiles, and top entries
 *
 * @param requestId - Rating request ID
 * @returns Comparison data with user score, averages, percentiles, and top 3 entries
 */
export declare function getComparisonData(requestId: string): Promise<ComparisonData>;
export interface FlavorText {
    compliment: string;
    roast: string;
    neutral?: string;
}
/**
 * Generate flavor text (compliment + roast) for a rating result
 * Uses AI if available, falls back to placeholder text
 *
 * @param requestId - Rating request ID
 * @returns Flavor text with compliment and roast
 */
export declare function generateFlavorText(requestId: string): Promise<FlavorText>;
