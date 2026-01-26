/**
 * Publish Draft Story API
 * Publish a draft story
 * v0.40.13 - Story Drafts 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { publishDraftStory, type StoryVisibility } from '@parel/story/storyDraftService';

/**
 * POST /api/story/drafts/publish
 * Publish draft story
 * Body: { storyId, visibility }
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

  const body = await req.json();
  const { storyId, visibility } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  const validVisibilities: StoryVisibility[] = ['public', 'private', 'friends'];
  if (!visibility || !validVisibilities.includes(visibility)) {
    return validationError('visibility must be "public", "private", or "friends"');
  }

  try {
    const published = await publishDraftStory(user.id, storyId, visibility);

    return successResponse({
      success: true,
      story: {
        id: published.id,
        status: published.status,
        visibility: published.visibility,
        publishedAt: published.publishedAt,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to publish draft');
  }
});

