/**
 * AURE Interaction Engine - Quest Progress API
 * Increment quest progress
 * v0.39.6 - Intelligent Quests
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { incrementQuestProgress } from '@/lib/aure/interaction/questsService';

/**
 * POST /api/aure/interaction/quests/progress
 * Increment quest progress
 * Body: { questId: string, amount?: number }
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
    const { questId, amount } = body;

    if (!questId) {
      return validationError('questId is required');
    }

    const result = await incrementQuestProgress(user.id, questId, amount || 1);

    return successResponse({
      success: result.success,
      completed: result.completed,
      message: result.completed ? 'Quest completed!' : 'Progress updated',
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to update quest progress');
  }
});

