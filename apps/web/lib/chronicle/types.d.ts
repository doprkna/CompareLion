/**
 * World Chronicle Types & Enums
 * Shared types, enums, and interfaces for World Chronicle 2.0
 * v0.36.43 - World Chronicle 2.0
 */
/**
 * XP Leader entry
 */
export interface XPLeader {
    userId: string;
    username?: string | null;
    name?: string | null;
    xp: number;
    level: number;
}
/**
 * Funniest answer entry
 */
export interface FunniestAnswer {
    userId: string;
    username?: string | null;
    questionId?: string | null;
    answerText: string;
    upvotes?: number;
    timestamp: Date;
}
/**
 * Rare drop entry
 */
export interface RareDrop {
    userId: string;
    username?: string | null;
    itemId: string;
    itemName: string;
    rarity: string;
    timestamp: Date;
}
/**
 * Highlight event entry
 */
export interface HighlightEvent {
    eventId: string;
    eventName: string;
    description?: string | null;
    startAt: Date;
    endAt: Date;
    participantCount?: number;
}
/**
 * Chronicle stats snapshot
 */
export interface ChronicleStatsSnapshot {
    xpLeaders: XPLeader[];
    funniestAnswers: FunniestAnswer[];
    rareDrops: RareDrop[];
    events: HighlightEvent[];
    globalStats?: {
        totalXP: number;
        totalGold: number;
        totalMissionsCompleted: number;
        totalFightsWon: number;
        activeUsers: number;
    };
}
/**
 * Chronicle entry
 */
export interface ChronicleEntry {
    id: string;
    seasonId?: string | null;
    weekNumber: number;
    summaryJSON: ChronicleStatsSnapshot;
    aiStory?: string | null;
    createdAt: Date;
    season?: {
        id: string;
        name: string;
    } | null;
}
/**
 * Chronicle generation input
 */
export interface ChronicleGenerationInput {
    seasonId?: string | null;
    weekNumber: number;
    startDate: Date;
    endDate: Date;
}
/**
 * Chronicle generation result
 */
export interface ChronicleGenerationResult {
    success: boolean;
    chronicleId?: string;
    preview?: ChronicleStatsSnapshot;
    error?: string;
}
/**
 * Calculate week number from date
 */
export declare function getWeekNumber(date: Date): number;
/**
 * Get start and end dates for a week
 */
export declare function getWeekDates(weekNumber: number, year: number): {
    start: Date;
    end: Date;
};
/**
 * Format chronicle date range
 */
export declare function formatChronicleDateRange(start: Date, end: Date): string;
