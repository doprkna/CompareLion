/**
 * Master Seed Function
 * v0.35.14a - Fixed item seeding with proper field names
 */
export interface SeedStats {
    users: number;
    achievements: number;
    items: number;
    questions: number;
    messages: number;
    notifications: number;
    events: number;
    leaderboard: number;
    duration: string;
}
export interface SeedResult {
    success: boolean;
    stats: SeedStats;
    errors: string[];
}
/**
 * Master seed function - seeds all modules
 */
export declare function seedAll(): Promise<SeedResult>;
