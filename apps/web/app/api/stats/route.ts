/**
 * Stats API
 * GET /api/stats - Get user's final stats and base attributes
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  successResponse,
} from '@/lib/api-handler';
import { calculateFinalStats } from '@/lib/rpg/finalStats';
import { getXPProgress, getXPForNextLevel } from '@/lib/levelCurve';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Calculate final stats
  const finalStats = await calculateFinalStats(user.id);

  // Get XP progress
  const xpProgress = getXPProgress(finalStats.xp, finalStats.level);
  const xpForNextLevel = getXPForNextLevel(finalStats.level);

  return successResponse({
    stats: finalStats,
    xpProgress,
    xpForNextLevel,
  });
});

