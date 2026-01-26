/**
 * Story Collection Detail API
 * Get collection by ID with stories
 * v0.40.10 - Story Collections (Albums)
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getCollection } from '@parel/story/storyCollectionService';

/**
 * GET /api/story/collections/[id]
 * Get collection by ID with stories
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const collectionId = params.id;

  if (!collectionId) {
    return validationError('Collection ID is required');
  }

  try {
    const result = await getCollection(collectionId);

    return successResponse({
      success: true,
      collection: {
        id: result.collection.id,
        userId: result.collection.userId,
        name: result.collection.name,
        description: result.collection.description,
        isPublic: result.collection.isPublic,
        createdAt: result.collection.createdAt,
      },
      stories: result.stories.map((s) => ({
        itemId: s.itemId,
        storyId: s.storyId,
        userId: s.userId,
        user: s.user,
        coverImageUrl: s.coverImageUrl,
        createdAt: s.createdAt,
        reactions: s.reactions,
        stickers: s.stickers,
      })),
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch collection');
  }
});

