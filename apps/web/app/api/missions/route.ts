/**
 * Missions API
 * GET /api/missions
 * Lists active missions with progress for current user
 * Query params: ?type=daily|weekly|quest (optional filter)
 * v0.36.36 - Missions & Quests 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { MissionType, MissionWithProgress, calculateProgressPercent } from '@/lib/missions/types';
import { assignMissions, needsDailyReset, needsWeeklyReset, getDayStart, getWeekStart } from '@/lib/missions/missionEngine';

export const runtime = 'nodejs';

/**
 * GET /api/missions
 * Returns active missions grouped by type with user progress
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const typeFilter = searchParams.get('type') as MissionType | null;

  // TODO: Implement once Mission and MissionProgress models exist
  // For now, return empty structure that will work once models are added
  
  // 1. Get all active missions (filtered by type if provided)
  // 2. Get user's progress for those missions
  // 3. Check if daily/weekly reset is needed and assign new missions
  // 4. Combine missions with progress data
  // 5. Group by type (daily/weekly/quest)

  const missions: MissionWithProgress[] = [];

  // Check for daily reset and assign missions
  // This will work once models exist:
  // const dailyResetNeeded = needsDailyReset(user.lastDailyMissionReset);
  // if (dailyResetNeeded) {
  //   await assignMissions(user.id, MissionType.DAILY);
  // }

  // Check for weekly reset and assign missions
  // const weeklyResetNeeded = needsWeeklyReset(user.lastWeeklyMissionReset);
  // if (weeklyResetNeeded) {
  //   await assignMissions(user.id, MissionType.WEEKLY);
  // }

  // Group missions by type
  const dailyMissions = missions.filter(m => m.type === MissionType.DAILY);
  const weeklyMissions = missions.filter(m => m.type === MissionType.WEEKLY);
  const questMissions = missions.filter(m => m.type === MissionType.QUEST);

  return successResponse({
    missions: {
      daily: dailyMissions,
      weekly: weeklyMissions,
      quest: questMissions,
    },
    total: missions.length,
  });
});

