/**
 * Current Season API
 * v0.18.0 - Get active season information
 * v0.22.5 - Add caching for season metadata
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { cache } from '@/lib/cache';
import { safeAsync, successResponse, notFoundError } from '@/lib/api-handler';

/**
 * GET /api/season/current
 * Get the currently active season (cached for 10 minutes)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const now = new Date();

  // Cache key for current season
  const seasonCacheKey = 'season:current';
  const topPlayersCacheKey = 'season:current:topPlayers';

  // Check cache for season data
  const cachedSeason = cache.get<any>(seasonCacheKey);
  const cachedTopPlayers = cache.get<any>(topPlayersCacheKey);

  let season;

  if (cachedSeason) {
    season = cachedSeason;
  } else {
    // Find active season
    season = await prisma.season.findFirst({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        number: true,
        startDate: true,
        endDate: true,
        status: true,
        metadata: true,
      },
    });

    // If no active season, find upcoming season
    if (!season) {
      season = await prisma.season.findFirst({
        where: {
          status: 'UPCOMING',
          startDate: { gt: now },
        },
        orderBy: {
          startDate: 'asc',
        },
        select: {
          id: true,
          name: true,
          displayName: true,
          number: true,
          startDate: true,
          endDate: true,
          status: true,
          metadata: true,
        },
      });
    }

    if (!season) {
      return notFoundError('No active or upcoming season found');
    }

    // Cache for 10 minutes (600 seconds) - season data rarely changes
    cache.set(seasonCacheKey, season, 600);
  }

  // Calculate time remaining (dynamic, not cached)
  const timeRemaining = season.endDate.getTime() - now.getTime();
  const timeUntilStart = season.startDate.getTime() - now.getTime();

  // Get top 3 players for preview
  let topPlayers;

  if (cachedTopPlayers) {
    topPlayers = cachedTopPlayers;
  } else {
    topPlayers = await prisma.user.findMany({
      where: {
        seasonalXP: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        seasonalXP: true,
        level: true,
      },
      orderBy: {
        seasonalXP: 'desc',
      },
      take: 3,
    });

    // Cache for 5 minutes (300 seconds)
    cache.set(topPlayersCacheKey, topPlayers, 300);
  }

  return successResponse({
    season: {
      ...season,
      timeRemaining: season.status === 'ACTIVE' ? Math.max(0, timeRemaining) : null,
      timeUntilStart: season.status === 'UPCOMING' ? Math.max(0, timeUntilStart) : null,
      daysRemaining: season.status === 'ACTIVE' ? Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)) : null,
      daysUntilStart: season.status === 'UPCOMING' ? Math.ceil(timeUntilStart / (1000 * 60 * 60 * 24)) : null,
    },
    topPlayers,
    cached: !!(cachedSeason && cachedTopPlayers),
  });
});

