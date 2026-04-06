/**
 * VS Mode Service
 * Two-item comparison and voting
 * v0.38.16 - VS Mode
 */
import { RatingMetrics } from './ratingService';
export interface MetricComparison {
    id: string;
    label: string;
    left: number;
    right: number;
    winner: 'left' | 'right' | 'tie';
}
export interface VsComparisonResult {
    vsId: string;
    winner: 'left' | 'right' | 'tie';
    metrics: MetricComparison[];
    leftResult: {
        requestId: string;
        metrics: RatingMetrics;
        summary: string;
        roast: string;
        imageUrl: string | null;
    };
    rightResult: {
        requestId: string;
        metrics: RatingMetrics;
        summary: string;
        roast: string;
        imageUrl: string | null;
    };
    userVote?: 'left' | 'right';
    voteCounts: {
        left: number;
        right: number;
    };
}
/**
 * Compare two rating results
 * Computes winner per metric and overall winner
 *
 * @param leftRequestId - Left item rating request ID
 * @param rightRequestId - Right item rating request ID
 * @returns Comparison result
 */
export declare function compareTwoItems(leftRequestId: string, rightRequestId: string): Promise<{
    winner: 'left' | 'right' | 'tie';
    metrics: MetricComparison[];
}>;
/**
 * Get full VS comparison result
 *
 * @param vsId - VS request ID
 * @param userId - Optional user ID for vote state
 * @returns Full comparison result
 */
export declare function getVsComparison(vsId: string, userId?: string): Promise<VsComparisonResult | null>;
/**
 * Vote on a VS comparison
 *
 * @param userId - User ID
 * @param vsId - VS request ID
 * @param choice - User's choice: "left" or "right"
 * @returns Vote result with updated counts
 */
export declare function voteOnVs(userId: string, vsId: string, choice: 'left' | 'right'): Promise<{
    success: boolean;
    choice: 'left' | 'right';
    voteCounts: {
        left: number;
        right: number;
    };
}>;
/**
 * Create a VS comparison
 * Creates two rating requests and one VS request
 *
 * @param userId - User ID
 * @param leftImageUrl - Left item image URL
 * @param rightImageUrl - Right item image URL
 * @param category - Category for both items
 * @returns Created VS request ID
 */
export declare function createVsComparison(userId: string, leftImageUrl: string, rightImageUrl: string, category: string): Promise<{
    vsId: string;
}>;
