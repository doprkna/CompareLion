/**
 * AURE Interaction Engine - Quests API
 * Get active quests and complete quests
 * v0.39.2 - AURE Interaction Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getActiveQuests, completeQuest } from '@/lib/aure/interaction/questsService';

/**
 * GET /api/aure/interaction/quests
 * Get active quests for user
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

    return successResponse({
      quests: quests.map((q) => ({
        questId: q.questId,
        type: q.quest.type,
        description: q.quest.description,
        rewardXp: q.quest.rewardXp,
        isDaily: q.quest.isDaily,
        isWeekly: q.quest.isWeekly,
        progress: q.progress,
        required: q.required,
        completedAt: q.completedAt?.toISOString() || null,
      })),
    });
  } catch (error: any) {
    return successResponse({
      quests: [],
      error: error.message || 'Failed to load quests',
    });
  }
});

