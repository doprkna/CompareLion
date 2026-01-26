/**
 * Session Summary API
 * Get taste profile summary for completed session
 * v0.38.17 - Batch Rating Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getSessionSummary } from '@/lib/rating/sessionService';

/**
 * GET /api/rating/session/summary?sessionId=XYZ
 * Get session summary (taste profile)
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
    const summary = await getSessionSummary(sessionId, user.id);

    return successResponse({
      success: true,
      summary,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get session summary');
  }
});

