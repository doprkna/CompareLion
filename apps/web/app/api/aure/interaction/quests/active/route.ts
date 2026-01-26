/**
 * AURE Interaction Engine - Active Quests API
 * Get active daily + weekly quests
 * v0.39.6 - Intelligent Quests
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getActiveQuests } from '@/lib/aure/interaction/questsService';

/**
 * GET /api/aure/interaction/quests/active
 * Get active quests for user (daily + weekly)
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

  try {
    const quests = await getActiveQuests(user.id);

    // Separate daily and weekly
    const dailyQuests = quests.filter((q) => q.quest.frequency === 'daily');
    const weeklyQuests = quests.filter((q) => q.quest.frequency === 'weekly');

    return successResponse({
      daily: dailyQuests.map((q) => ({
        questId: q.questId,
        type: q.quest.type,
        description: q.quest.description,
        rewardXp: q.quest.rewardXp,
        frequency: q.quest.frequency,
        progress: q.progress,
        required: q.required,
        completedAt: q.completedAt?.toISOString() || null,
      })),
      weekly: weeklyQuests.map((q) => ({
        questId: q.questId,
        type: q.quest.type,
        description: q.quest.description,
        rewardXp: q.quest.rewardXp,
        frequency: q.quest.frequency,
        progress: q.progress,
        required: q.required,
        completedAt: q.completedAt?.toISOString() || null,
      })),
    });
  } catch (error: any) {
    return successResponse({
      daily: [],
      weekly: [],
      error: error.message || 'Failed to load quests',
    });
  }
});

