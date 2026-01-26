/**
 * Photo Challenge Leaderboard API
 * Get weekly leaderboard rankings
 * v0.37.14 - Snack Leaderboard
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getWeeklyLeaderboard, getUserRank } from '@/lib/challenge/photo/leaderboardService';

/**
 * GET /api/challenge/photo/leaderboard?category=XYZ
 * Get weekly leaderboard with top entries and user's rank
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Get user ID if authenticated (for user rank)
  let userId: string | undefined;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;

  // Get top entries
  const topEntries = await getWeeklyLeaderboard(category, 20);

  // Get user's rank if authenticated
  let userRank: { rank: number; total: number } | null = null;
  if (userId) {
    const rank = await getUserRank(userId, category);
    if (rank) {
      userRank = {
        rank: rank.rank,
        total: rank.total,
      };
    }
  }

  return successResponse({
    success: true,
    topEntries,
    userRank,
    total: topEntries.length,
  });
});

