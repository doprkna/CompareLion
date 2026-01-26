/**
 * Get Next Session Item API
 * Get next item to rate in session
 * v0.38.17 - Batch Rating Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getNextSessionItem } from '@/lib/rating/sessionService';

/**
 * GET /api/rating/session/next?sessionId=XYZ
 * Get next item to rate in session
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
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return validationError('sessionId is required');
  }

  try {
    const nextItem = await getNextSessionItem(sessionId, user.id);

    if (!nextItem) {
      return successResponse({
        success: true,
        completed: true,
        item: null,
      });
    }

    return successResponse({
      success: true,
      completed: false,
      item: {
        sessionItemId: nextItem.sessionItemId,
        index: nextItem.index,
        itemData: nextItem.itemData,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get next item');
  }
});

