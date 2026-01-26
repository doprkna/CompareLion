/**
 * Story Collection Remove API
 * Remove story from collection
 * v0.40.10 - Story Collections (Albums)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { removeStoryFromCollection } from '@parel/story/storyCollectionService';

/**
 * POST /api/story/collections/remove
 * Remove story from collection
 * Body: { itemId }
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
  const { itemId } = body;

  if (!itemId || typeof itemId !== 'string') {
    return validationError('itemId is required');
  }

  try {
    await removeStoryFromCollection(user.id, itemId);

    return successResponse({
      success: true,
      message: 'Story removed from collection successfully',
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to remove story from collection');
  }
});

