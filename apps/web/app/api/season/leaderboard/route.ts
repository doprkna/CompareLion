/**
 * Season Leaderboard API
 * v0.18.0 - Get seasonal rankings
 * v0.22.5 - Add caching for heavy aggregations
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { cache } from '@/lib/cache';
import { safeAsync, successResponse } from '@/lib/api-handler';

/**
 * GET /api/season/leaderboard
 * Get seasonal leaderboard rankings (cached for 5 minutes)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Get current user if authenticated
  const session = await getServerSession(authOptions);
  let currentUserId: string | undefined;
  
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    currentUserId = user?.id;
  }

  // Cache leaderboard data (but not user-specific rank)
  const leaderboardCacheKey = `season:leaderboard:${limit}:${offset}`;
  const cachedLeaderboard = cache.get<any>(leaderboardCacheKey);

  let rankedPlayers;
  let totalPlayers;

  if (cachedLeaderboard) {
    rankedPlayers = cachedLeaderboard.players;
    totalPlayers = cachedLeaderboard.totalPlayers;
  } else {
    // Fetch top players by seasonal XP
    const players = await prisma.user.findMany({
      where: {
        seasonalXP: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        seasonalXP: true,
        coins: true,
        level: true,
        karmaScore: true,
        streakCount: true,
        equippedTitle: true,
        equippedIcon: true,
        equippedBackground: true,
      },
      orderBy: {
        seasonalXP: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Add rank to each player
    rankedPlayers = players.map((player, index) => ({
      ...player,
      rank: offset + index + 1,
    }));

    // Get total player count
    totalPlayers = await prisma.user.count({
      where: {
        seasonalXP: { gt: 0 },
      },
    });

    // Cache for 5 minutes (300 seconds)
    cache.set(leaderboardCacheKey, { players: rankedPlayers, totalPlayers }, 300);
  }

  // Get current user's rank if authenticated (not cached - user-specific)
  let currentUserRank = null;
  if (currentUserId) {
    const usersAbove = await prisma.user.count({
      where: {
        seasonalXP: {
          gt: await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { seasonalXP: true },
          }).then(u => u?.seasonalXP || 0),
        },
      },
    });
    currentUserRank = usersAbove + 1;

    // Get current user's data if not in top list
    if (currentUserRank > limit && !rankedPlayers.find((p: any) => p.id === currentUserId)) {
      const currentUser = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          seasonalXP: true,
          coins: true,
          level: true,
          karmaScore: true,
          streakCount: true,
          equippedTitle: true,
          equippedIcon: true,
          equippedBackground: true,
        },
      });

      if (currentUser) {
        rankedPlayers.push({
          ...currentUser,
          rank: currentUserRank,
        });
      }
    }
  }

  return successResponse({
    leaderboard: rankedPlayers,
    currentUserRank,
    pagination: {
      total: totalPlayers,
      limit,
      offset,
      hasMore: offset + limit < totalPlayers,
    },
    cached: !!cachedLeaderboard,
  });
});

