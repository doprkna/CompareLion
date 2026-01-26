/**
 * AURE Interaction Engine - Complete Quest API
 * Manually complete a quest
 * v0.39.6 - Intelligent Quests
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { completeQuest } from '@/lib/aure/interaction/questsService';

/**
 * POST /api/aure/interaction/quests/complete
 * Complete a quest
 * Body: { questId: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
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
    const body = await req.json();
    const { questId } = body;

    if (!questId) {
      return validationError('questId is required');
    }

    const result = await completeQuest(user.id, questId);

    return successResponse({
      success: result.success,
      xpAwarded: result.xpAwarded,
      message: `Quest completed! +${result.xpAwarded} XP`,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to complete quest');
  }
});
