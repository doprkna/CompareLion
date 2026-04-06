/**
 * Badge Seeding Script
 * Creates base badges in the database
 * v0.36.24 - Social Profiles 2.0
 *
 * Run: npx tsx apps/web/lib/seed-badges.ts
 */
export declare function seedBadges(): Promise<{
    created: number;
    skipped: number;
}>;
