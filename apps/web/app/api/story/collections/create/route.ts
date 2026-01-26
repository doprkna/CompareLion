/**
 * Story Collection Create API
 * Create story collection
 * v0.40.10 - Story Collections (Albums)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createStoryCollection, type StoryCollectionData } from '@parel/story/storyCollectionService';

/**
 * POST /api/story/collections/create
 * Create story collection
 * Body: { name, description?, isPublic }
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
  const { name, description, isPublic } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return validationError('name is required');
  }

  if (typeof isPublic !== 'boolean') {
    return validationError('isPublic must be a boolean');
  }

  try {
    const collection = await createStoryCollection(user.id, {
      name: name.trim(),
      description: description || '',
      isPublic,
    });

    return successResponse({
      success: true,
      collection: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        isPublic: collection.isPublic,
        createdAt: collection.createdAt,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create collection');
  }
});

