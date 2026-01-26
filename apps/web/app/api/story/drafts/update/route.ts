/**
 * Update Draft Story API
 * Update draft story metadata
 * v0.40.13 - Story Drafts 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { updateDraftStoryMetadata } from '@parel/story/storyDraftService';

/**
 * POST /api/story/drafts/update
 * Update draft story metadata
 * Body: { storyId, title? }
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
  const { storyId, title } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  try {
    const updated = await updateDraftStoryMetadata(user.id, storyId, {
      title: title !== undefined ? title : undefined,
    });

    return successResponse({
      success: true,
      story: {
        id: updated.id,
        title: updated.title,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to update draft');
  }
});

