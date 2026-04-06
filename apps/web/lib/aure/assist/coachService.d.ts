/**
 * AURE Assist Engine - AI Coach Service 2.0
 * Personalized Lifestyle Improvement Engine
 * v0.39.9 - Coach 2.0 (Adaptive + Premium-ready)
 */
export type CoachType = 'snack' | 'desk' | 'outfit' | 'room' | 'generic';
export interface CoachAdvice {
    tips: string[];
    summary: string;
    focusAreas: string[];
}
export interface CoachAnalysis {
    strengths: string[];
    weaknesses: string[];
    recentTrend: 'up' | 'down' | 'flat';
    avgMetrics: Record<string, number>;
}
export interface CoachGoal {
    id: string;
    userId: string;
    coachType: CoachType;
    title: string;
    description: string;
    targetMetric: string;
    targetDelta: number;
    progress: number;
    createdAt: Date;
    completedAt: Date | null;
}
export interface CoachSummary {
    id: string;
    userId: string;
    coachType: CoachType;
    weekOf: string;
    summaryText: string;
    createdAt: Date;
}
export interface CoachAnalysis {
    strengths: string[];
    weaknesses: string[];
    recentTrend: 'up' | 'down' | 'flat';
    avgMetrics: Record<string, number>;
}
export interface CoachGoal {
    id: string;
    userId: string;
    coachType: CoachType;
    title: string;
    description: string;
    targetMetric: string;
    targetDelta: number;
    progress: number;
    createdAt: Date;
    completedAt: Date | null;
}
export interface CoachSummary {
    id: string;
    userId: string;
    coachType: CoachType;
    weekOf: string;
    summaryText: string;
    createdAt: Date;
}
/**
 * Generate coach advice for user
 * Premium-only feature
 */
export declare function generateCoachAdvice(userId: string, coachType: CoachType): Promise<CoachAdvice | {
    error: 'premium_required';
}>;
/**
 * Analyze user for coach (Coach 2.0)
 * Returns strengths, weaknesses, and recent trend
 */
export declare function analyzeUserForCoach(userId: string, coachType: CoachType): Promise<CoachAnalysis | {
    error: 'premium_required';
}>;
/**
 * Generate coach goals (Coach 2.0)
 * AI generates 2-4 improvement goals
 * Note: Requires CoachGoal Prisma table for persistence (currently returns in-memory goals)
 */
export declare function generateCoachGoals(userId: string, coachType: CoachType): Promise<CoachGoal[] | {
    error: 'premium_required';
}>;
/**
 * Update goal progress (Coach 2.0)
 * Compares new AURE results vs target metrics
 * Note: Requires CoachGoal Prisma table for persistence
 */
export declare function updateGoalProgress(userId: string, coachType: CoachType): Promise<{
    updated: number;
} | {
    error: 'premium_required';
}>;
/**
 * Generate weekly coach summary (Coach 2.0)
 * Produces AI summary of goals + progress
 * Note: Requires CoachGoal and CoachSummary Prisma tables for persistence
 */
export declare function generateCoachSummary(userId: string, coachType: CoachType): Promise<CoachSummary | {
    error: 'premium_required';
}>;
