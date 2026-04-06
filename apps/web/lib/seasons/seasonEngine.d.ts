/**
 * Season Engine
 * Season management, rollover, and progression logic
 * v0.36.38 - Seasons & Battlepass 1.0
 */
import { Season, SeasonSummary } from './types';
/**
 * Get current active season
 * Returns the active season or null if none exists
 */
export declare function getCurrentSeason(): Promise<Season | null>;
/**
 * Close a season (mark as inactive)
 * Prepares season for rollover
 */
export declare function closeSeason(seasonId: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Generate season summary for rollover
 * Collects statistics about the season
 */
export declare function generateSeasonSummary(seasonId: string): Promise<SeasonSummary | null>;
/**
 * Initialize next season
 * Creates a new season with default tiers
 */
export declare function initializeNextSeason(seasonNumber: number, name?: string, durationDays?: number): Promise<{
    success: boolean;
    seasonId?: string;
    error?: string;
}>;
/**
 * Check if season needs rollover
 * Returns true if current season has ended
 */
export declare function needsRollover(): Promise<boolean>;
/**
 * Perform season rollover
 * Closes old season, generates summary, initializes next season
 */
export declare function performRollover(nextSeasonNumber: number, nextSeasonName?: string): Promise<{
    success: boolean;
    oldSeasonId?: string;
    newSeasonId?: string;
    error?: string;
}>;
