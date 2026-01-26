/**
 * Story Collection Add API
 * Add story to collection
 * v0.40.10 - Story Collections (Albums)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { addStoryToCollection } from '@parel/story/storyCollectionService';

/**
 * POST /api/story/collections/add
 * Add story to collection
 * Body: { collectionId, storyId }
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
  const { collectionId, storyId } = body;

  if (!collectionId || typeof collectionId !== 'string') {
    return validationError('collectionId is required');
  }

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  try {
    await addStoryToCollection(user.id, collectionId, storyId);

    return successResponse({
      success: true,
      message: 'Story added to collection successfully',
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to add story to collection');
  }
});

