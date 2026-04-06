/**
 * AURE Life Engine - Weekly Vibe Service
 * Generates weekly vibe summaries based on user activity
 * v0.39.1 - AURE Life Engine
 */
export interface WeeklyVibe {
    summary: string;
    categoryDistribution: Record<string, number>;
    avgScore: number;
    vibeChange?: string | null;
    generatedAt: Date;
}
/**
 * Generate weekly vibe summary for a user
 * Analyzes last 7 days of activity and generates AI summary
 */
export declare function generateWeeklyVibe(userId: string): Promise<WeeklyVibe>;
