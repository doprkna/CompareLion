/**
 * AURE Life Engine - Timeline API
 * Get user timeline events
 * v0.39.1 - AURE Life Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserTimeline } from '@/lib/aure/life/timelineService';

/**
 * GET /api/aure/life/timeline?limit=50
 * Get user timeline events
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
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const events = await getUserTimeline(user.id, limit);

    return successResponse({
      events: events.map((e) => ({
        id: e.id,
        type: e.type,
        referenceId: e.referenceId,
        category: e.category,
        createdAt: e.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    return successResponse({
      events: [],
      error: error.message || 'Failed to load timeline',
    });
  }
});

