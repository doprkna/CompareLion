/**
 * My Stories API
 * Get user's own stories
 * v0.40.7 - Story Publishing & Visibility Controls 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserStories } from '@parel/story/storyFeedService';

/**
 * GET /api/story/mine
 * Get user's own stories
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
    const stories = await getUserStories(user.id);

    return successResponse({
      success: true,
      stories: stories.map((story) => ({
        id: story.id,
        type: story.type,
        coverImageUrl: story.coverImageUrl,
        visibility: story.visibility,
        publishedAt: story.publishedAt,
        createdAt: story.createdAt,
      })),
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to fetch stories',
      stories: [],
    });
  }
});

