/**
 * AURE Life Engine - Yearly Wrap Service
 * Generates yearly personal recap based on AURE activity
 * v0.39.4 - AURE Yearly Wrap
 */
export interface YearlyWrapData {
    timelineStats: {
        totalEvents: number;
        eventsByType: Record<string, number>;
    };
    categoryBreakdown: Record<string, number>;
    archetypeHistory: {
        firstArchetype: string | null;
        lastArchetype: string | null;
        evolution: string;
    };
    topItems: Array<{
        requestId: string;
        category: string;
        totalScore: number;
        imageUrl: string | null;
    }>;
    worstItems: Array<{
        requestId: string;
        category: string;
        totalScore: number;
        imageUrl: string | null;
    }>;
    vibeStory: string;
    recommendation: string;
    shareableId: string;
}
/**
 * Generate yearly wrap for user
 * Aggregates data from last 12 months
 */
export declare function generateYearlyWrap(userId: string, year?: number): Promise<YearlyWrapData>;
