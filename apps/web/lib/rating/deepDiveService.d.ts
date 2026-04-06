/**
 * Deep Dive Analysis Service
 * Premium extended analysis for AURE ratings
 * v0.38.13 - Premium Deep Dive Analysis
 */
import { RatingMetrics } from './ratingService';
export interface DeepDiveAnalysis {
    extendedMetrics: RatingMetrics;
    longSummary: string;
    improvementTips: string[];
    cohortComparisons: {
        top10: RatingMetrics;
        median: RatingMetrics;
    };
}
/**
 * Generate deep dive analysis for a rating request
 * Premium-only extended analysis with more insights
 *
 * @param requestId - Rating request ID
 * @returns Deep dive analysis
 */
export declare function generateDeepDiveAnalysis(requestId: string): Promise<DeepDiveAnalysis>;
