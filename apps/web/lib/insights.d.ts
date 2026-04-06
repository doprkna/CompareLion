/**
 * Player Insight System (v0.8.1)
 *
 * PLACEHOLDER: Analyzes player behavior and generates personalized insights.
 */
export interface PlayerMetrics {
    creativity: number;
    social: number;
    knowledge: number;
    balance: boolean;
    streakDays: number;
    challengesCompleted: number;
    karma: number;
    prestige: number;
    mostActiveHour: number;
}
/**
 * Analyze user patterns and return metrics
 *
 * PLACEHOLDER: Returns mock metrics based on user stats
 */
export declare function analyzeUserPatterns(userId: string): Promise<PlayerMetrics>;
/**
 * Generate personalized insight for user
 *
 * PLACEHOLDER: Matches templates to metrics
 */
export declare function generateUserInsight(userId: string): Promise<any>;
/**
 * Get active insights for user
 */
export declare function getUserInsights(userId: string): Promise<any>;
