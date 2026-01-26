/**
 * AURE Interaction Engine - Refresh Quests API
 * Force refresh quests for a frequency
 * v0.39.6 - Intelligent Quests
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { refreshQuests } from '@/lib/aure/interaction/questsService';
import { QuestFrequency } from '@/lib/aure/interaction/questGenerator';

/**
 * POST /api/aure/interaction/quests/refresh?frequency=daily|weekly
 * Force refresh quests
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
    const { searchParams } = new URL(req.url);
    const frequency = searchParams.get('frequency') as QuestFrequency;

    if (!frequency || (frequency !== 'daily' && frequency !== 'weekly')) {
      return validationError('frequency must be "daily" or "weekly"');
    }

    await refreshQuests(user.id, frequency);

    return successResponse({
      success: true,
      message: `${frequency} quests refreshed`,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to refresh quests');
  }
});

