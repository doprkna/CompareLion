/**
 * Mood Update Cron (v0.29.26)
 *
 * POST /api/cron/mood/update
 * Aggregates logs hourly:
 * - Calculates mood ratios
 * - Sets dominantMood and applies global modifiers
 * - Auto-purges logs older than 7 days
 */
export declare const POST: any;
