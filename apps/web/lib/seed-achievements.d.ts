/**
 * Achievement Seeding Script
 * Creates base achievements in the database
 * v0.26.0 - Achievements Awakened
 *
 * Run: npx tsx apps/web/lib/seed-achievements.ts
 */
export declare function seedAchievements(): Promise<{
    created: number;
    skipped: number;
}>;
