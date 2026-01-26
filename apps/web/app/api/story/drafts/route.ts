/**
 * Story Drafts API
 * Get user's draft stories
 * v0.40.13 - Story Drafts 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserDraftStories } from '@parel/story/storyDraftService';

/**
 * GET /api/story/drafts
 * Get user's draft stories
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
    const drafts = await getUserDraftStories(user.id);

    return successResponse({
      success: true,
      drafts: drafts.map((d) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        coverImageUrl: d.coverImageUrl,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to fetch drafts',
      drafts: [],
    });
  }
});

