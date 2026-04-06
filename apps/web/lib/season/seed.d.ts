/**
 * Season Pass Seed Script
 * v0.36.23 - Season Pass System
 *
 * Seeds initial season with 20 tiers and rewards
 */
/**
 * Seed initial season with 20 tiers
 */
export declare function seedSeason(seasonNumber?: number): Promise<string>;
/**
 * Activate a season (deactivate others)
 */
export declare function activateSeason(seasonId: string): Promise<void>;
