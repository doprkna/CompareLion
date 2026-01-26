/**
 * My Story Collections API
 * Get user's collections
 * v0.40.10 - Story Collections (Albums)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserCollections } from '@parel/story/storyCollectionService';

/**
 * GET /api/story/collections/mine
 * Get user's collections
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
    const collections = await getUserCollections(user.id);

    return successResponse({
      success: true,
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isPublic: c.isPublic,
        createdAt: c.createdAt,
      })),
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to fetch collections',
      collections: [],
    });
  }
});

