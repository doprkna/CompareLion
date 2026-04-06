/**
 * Parel Story Generator - Weekly Story Service
 * Auto-generates weekly recap stories from user activity
 * v0.40.3 - Auto-Story from Weekly Activity (My Week Story)
 */
export interface WeeklyActivity {
    topImages: Array<{
        imageUrl: string;
        category: string;
        caption?: string;
        requestId: string;
    }>;
    vibeSummary: string;
    archetypeChange?: {
        from: string | null;
        to: string;
        reason?: string | null;
    };
    questHighlights: string[];
    weirdMoments: string[];
    categoryDistribution: Record<string, number>;
    totalRatings: number;
    avgScore: number;
}
export interface WeeklyStoryPanel {
    role: 'intro' | 'build' | 'peak' | 'outro';
    imageUrl: string;
    caption: string;
    vibeTag: string;
    microStory: string;
}
export interface WeeklyStory {
    title: string;
    panels: WeeklyStoryPanel[];
    outro: string;
}
/**
 * Get weekly activity data (last 7 days)
 */
export declare function getWeeklyActivity(userId: string): Promise<WeeklyActivity>;
/**
 * Generate weekly story from activity data
 * Cached for 1 hour to avoid regenerating same story multiple times
 */
export declare function generateWeeklyStory(data: WeeklyActivity, userId?: string): Promise<WeeklyStory>;
