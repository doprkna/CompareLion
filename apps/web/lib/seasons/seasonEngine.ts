/**
 * Season Engine
 * Season management, rollover, and progression logic
 * v0.36.38 - Seasons & Battlepass 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { Season, SeasonSummary, isSeasonActive, getDaysRemaining } from './types';

/**
 * Get current active season
 * Returns the active season or null if none exists
 */
export async function getCurrentSeason(): Promise<Season | null> {
  try {
    // Try battlePassSeason model first (newer system)
    const battlePassSeason = await prisma.battlePassSeason.findFirst({
      where: {
        startsAt: { lte: new Date() },
        endsAt: { gte: new Date() },
      },
      orderBy: { seasonNumber: 'desc' },
    });

    if (battlePassSeason) {
      return {
        id: battlePassSeason.id,
        name: battlePassSeason.name,
        seasonNumber: battlePassSeason.seasonNumber,
        startsAt: battlePassSeason.startsAt,
        endsAt: battlePassSeason.endsAt,
        isActive: true,
        premiumPrice: battlePassSeason.premiumPrice,
      };
    }

    // Fallback to season model (older system)
    const season = await prisma.season.findFirst({
      where: { isActive: true },
      orderBy: { seasonNumber: 'desc' },
    });

    if (season) {
      return {
        id: season.id,
        name: season.name,
        seasonNumber: season.seasonNumber,
        startsAt: season.startsAt,
        endsAt: season.endsAt,
        isActive: season.isActive,
        premiumPrice: null,
      };
    }

    return null;
  } catch (error) {
    logger.error('[SeasonEngine] Failed to get current season', error);
    return null;
  }
}

/**
 * Close a season (mark as inactive)
 * Prepares season for rollover
 */
export async function closeSeason(seasonId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Try battlePassSeason model first
    const battlePassSeason = await prisma.battlePassSeason.findUnique({
      where: { id: seasonId },
    });

    if (battlePassSeason) {
      await prisma.battlePassSeason.update({
        where: { id: seasonId },
        data: { isActive: false },
      });
      logger.info(`[SeasonEngine] Closed battlePassSeason ${seasonId}`);
      return { success: true };
    }

    // Fallback to season model
    const season = await prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (season) {
      await prisma.season.update({
        where: { id: seasonId },
        data: { isActive: false },
      });
      logger.info(`[SeasonEngine] Closed season ${seasonId}`);
      return { success: true };
    }

    return { success: false, error: 'Season not found' };
  } catch (error) {
    logger.error('[SeasonEngine] Failed to close season', { seasonId, error });
    return { success: false, error: 'Failed to close season' };
  }
}

/**
 * Generate season summary for rollover
 * Collects statistics about the season
 */
export async function generateSeasonSummary(seasonId: string): Promise<SeasonSummary | null> {
  try {
    // TODO: Implement once UserBattlepassProgress model structure is clear
    // This will aggregate:
    // - Total users who participated
    // - Total XP earned
    // - Average level reached
    // - Max level reached
    // - Premium users count
    // - Total rewards claimed

    logger.info(`[SeasonEngine] Generating summary for season ${seasonId}`);
    
    return {
      seasonId,
      seasonNumber: 1,
      totalUsers: 0,
      totalXP: 0,
      averageLevel: 0,
      maxLevel: 0,
      premiumUsers: 0,
      totalRewardsClaimed: 0,
    };
  } catch (error) {
    logger.error('[SeasonEngine] Failed to generate season summary', { seasonId, error });
    return null;
  }
}

/**
 * Initialize next season
 * Creates a new season with default tiers
 */
export async function initializeNextSeason(
  seasonNumber: number,
  name?: string,
  durationDays: number = 30
): Promise<{ success: boolean; seasonId?: string; error?: string }> {
  try {
    const startsAt = new Date();
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + durationDays);

    // Try battlePassSeason model first
    try {
      const battlePassSeason = await prisma.battlePassSeason.create({
        data: {
          name: name || `Season ${seasonNumber}`,
          seasonNumber,
          startsAt,
          endsAt,
          isActive: true,
          premiumPrice: null,
          tiers: [], // Will be populated by admin or seed script
        },
      });

      logger.info(`[SeasonEngine] Initialized battlePassSeason ${battlePassSeason.id}`);
      return { success: true, seasonId: battlePassSeason.id };
    } catch (error) {
      // Fallback to season model
      const season = await prisma.season.create({
        data: {
          name: name || `Season ${seasonNumber}`,
          seasonNumber,
          startsAt,
          endsAt,
          isActive: true,
        },
      });

      logger.info(`[SeasonEngine] Initialized season ${season.id}`);
      return { success: true, seasonId: season.id };
    }
  } catch (error) {
    logger.error('[SeasonEngine] Failed to initialize next season', { seasonNumber, error });
    return { success: false, error: 'Failed to initialize season' };
  }
}

/**
 * Check if season needs rollover
 * Returns true if current season has ended
 */
export async function needsRollover(): Promise<boolean> {
  const currentSeason = await getCurrentSeason();
  if (!currentSeason) {
    return false; // No active season, might need to create one
  }

  return !isSeasonActive(currentSeason);
}

/**
 * Perform season rollover
 * Closes old season, generates summary, initializes next season
 */
export async function performRollover(
  nextSeasonNumber: number,
  nextSeasonName?: string
): Promise<{ success: boolean; oldSeasonId?: string; newSeasonId?: string; error?: string }> {
  try {
    const currentSeason = await getCurrentSeason();
    
    if (!currentSeason) {
      // No current season, just initialize new one
      const result = await initializeNextSeason(nextSeasonNumber, nextSeasonName);
      return {
        success: result.success,
        newSeasonId: result.seasonId,
        error: result.error,
      };
    }

    // Close current season
    const closeResult = await closeSeason(currentSeason.id);
    if (!closeResult.success) {
      return { success: false, error: closeResult.error };
    }

    // Generate summary (for archival)
    await generateSeasonSummary(currentSeason.id);

    // Initialize next season
    const initResult = await initializeNextSeason(nextSeasonNumber, nextSeasonName);
    if (!initResult.success) {
      return { success: false, error: initResult.error };
    }

    logger.info(`[SeasonEngine] Rollover complete: ${currentSeason.id} → ${initResult.seasonId}`);

    return {
      success: true,
      oldSeasonId: currentSeason.id,
      newSeasonId: initResult.seasonId,
    };
  } catch (error) {
    logger.error('[SeasonEngine] Failed to perform rollover', error);
    return { success: false, error: 'Failed to perform rollover' };
  }
}

