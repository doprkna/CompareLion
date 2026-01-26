/**
 * Story View API
 * Increment story view count
 * v0.40.12 - Story Analytics 1.0 (Views, Reactions, Engagement)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { incrementStoryView } from '@parel/story/storyAnalyticsService';

/**
 * POST /api/story/view
 * Increment story view count
 * Body: { storyId }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Optional auth - allow anonymous views
  let userId: string | null = null;

  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (user) {
      userId = user.id;
    }
  }

  const body = await req.json();
  const { storyId } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  try {
    const viewCount = await incrementStoryView(storyId, userId);

    return successResponse({
      success: true,
      viewCount,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to increment view count');
  }
});

