/**
 * BattlePass API
 * GET /api/battlepass - Get current battlepass progress
 * v0.36.28 - BattlePass 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getBattlePassProgress } from '@/lib/services/battlepassService';
import { getDailyMissions, getWeeklyMissions } from '@/lib/services/missionService';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to view battlepass');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get battlepass progress
  const progress = await getBattlePassProgress(user.id);
  
  // Get missions
  const dailyMissions = await getDailyMissions(user.id);
  const weeklyMissions = await getWeeklyMissions(user.id);

  return successResponse({
    progress,
    missions: {
      daily: dailyMissions,
      weekly: weeklyMissions,
    },
  });
});

