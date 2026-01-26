/**
 * Story Collection Service
 * Handles story collections (albums) and items
 * v0.40.10 - Story Collections (Albums)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { getStickerById } from './stickers';

export interface StoryCollectionData {
  name: string;
  description: string;
  isPublic: boolean;
}

export interface StoryCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: Date;
}

export interface CollectionStory {
  itemId: string;
  storyId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
  coverImageUrl: string | null;
  createdAt: Date;
  reactions: {
    like: number;
    lol: number;
    vibe: number;
  };
  stickers: Array<{
    id: string;
    emoji: string;
    count: number;
  }>;
}

/**
 * Create story collection
 */
export async function createStoryCollection(
  userId: string,
  data: StoryCollectionData
): Promise<StoryCollection> {
  try {
    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Collection name is required');
    }

    const collection = await prisma.storyCollection.create({
      data: {
        userId,
        name: data.name.trim(),
        description: data.description?.trim() || '',
        isPublic: data.isPublic,
      },
    });

    return {
      id: collection.id,
      userId: collection.userId,
      name: collection.name,
      description: collection.description,
      isPublic: collection.isPublic,
      createdAt: collection.createdAt,
    };
  } catch (error) {
    logger.error('[StoryCollection] Failed to create collection', { error, userId, data });
    throw error;
  }
}

/**
 * Add story to collection
 */
export async function addStoryToCollection(
  userId: string,
  collectionId: string,
  storyId: string
): Promise<void> {
  try {
    // Verify collection belongs to user
    const collection = await prisma.storyCollection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    if (collection.userId !== userId) {
      throw new Error('Unauthorized: Collection does not belong to user');
    }

    // Verify story belongs to user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.userId !== userId) {
      throw new Error('Unauthorized: Story does not belong to user');
    }

    // Check if already in collection
    const existing = await prisma.storyCollectionItem.findFirst({
      where: {
        collectionId,
        storyId,
      },
    });

    if (existing) {
      throw new Error('Story already in collection');
    }

    // Add to collection
    await prisma.storyCollectionItem.create({
      data: {
        collectionId,
        storyId,
      },
    });
  } catch (error) {
    logger.error('[StoryCollection] Failed to add story to collection', {
      error,
      userId,
      collectionId,
      storyId,
    });
    throw error;
  }
}

/**
 * Remove story from collection
 */
export async function removeStoryFromCollection(
  userId: string,
  itemId: string
): Promise<void> {
  try {
    // Verify item exists and collection belongs to user
    const item = await prisma.storyCollectionItem.findUnique({
      where: { id: itemId },
      include: {
        collection: {
          select: { userId: true },
        },
      },
    });

    if (!item) {
      throw new Error('Collection item not found');
    }

    if (item.collection.userId !== userId) {
      throw new Error('Unauthorized: Collection does not belong to user');
    }

    // Remove item
    await prisma.storyCollectionItem.delete({
      where: { id: itemId },
    });
  } catch (error) {
    logger.error('[StoryCollection] Failed to remove story from collection', { error, userId, itemId });
    throw error;
  }
}

/**
 * Get collection with stories
 */
export async function getCollection(collectionId: string): Promise<{
  collection: StoryCollection;
  stories: CollectionStory[];
}> {
  try {
    const collection = await prisma.storyCollection.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          include: {
            story: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc', // Manual order (user controls)
          },
        },
      },
    });

    if (!collection) {
      throw new Error('Collection not found');
    }

    const collectionData: StoryCollection = {
      id: collection.id,
      userId: collection.userId,
      name: collection.name,
      description: collection.description,
      isPublic: collection.isPublic,
      createdAt: collection.createdAt,
    };

    // Get story IDs for reaction/sticker aggregation
    const storyIds = collection.items.map((item) => item.storyId);

    // Get reaction counts
    const reactions = await prisma.storyReaction.groupBy({
      by: ['storyId', 'type'],
      where: {
        storyId: { in: storyIds },
      },
      _count: { id: true },
    });

    // Build reaction counts map
    const reactionCountsMap = new Map<string, { like: number; lol: number; vibe: number }>();
    storyIds.forEach((id) => {
      reactionCountsMap.set(id, { like: 0, lol: 0, vibe: 0 });
    });

    reactions.forEach((r) => {
      const counts = reactionCountsMap.get(r.storyId) || { like: 0, lol: 0, vibe: 0 };
      if (r.type === 'like') counts.like = r._count.id;
      if (r.type === 'lol') counts.lol = r._count.id;
      if (r.type === 'vibe') counts.vibe = r._count.id;
      reactionCountsMap.set(r.storyId, counts);
    });

    // Get sticker counts
    const stickerReactions = await prisma.storyReaction.groupBy({
      by: ['storyId', 'type'],
      where: {
        storyId: { in: storyIds },
        type: { startsWith: 'sticker:' },
      },
      _count: { id: true },
    });

    const stickerCountsMap = new Map<string, Map<string, number>>();
    storyIds.forEach((id) => {
      stickerCountsMap.set(id, new Map());
    });

    stickerReactions.forEach((r) => {
      const stickerId = r.type.substring(8);
      const stickerMap = stickerCountsMap.get(r.storyId) || new Map();
      stickerMap.set(stickerId, r._count.id);
      stickerCountsMap.set(r.storyId, stickerMap);
    });

    // Build stories array
    const stories: CollectionStory[] = collection.items.map((item) => {
      const stickerMap = stickerCountsMap.get(item.storyId) || new Map();
      const stickers = Array.from(stickerMap.entries())
        .map(([stickerId, count]) => {
          const sticker = getStickerById(stickerId);
          if (!sticker) return null;
          return {
            id: stickerId,
            emoji: sticker.emoji,
            count,
          };
        })
        .filter((s): s is { id: string; emoji: string; count: number } => s !== null)
        .sort((a, b) => b.count - a.count);

      return {
        itemId: item.id,
        storyId: item.storyId,
        userId: item.story.userId,
        user: {
          id: item.story.user.id,
          name: item.story.user.name,
          username: item.story.user.username,
        },
        coverImageUrl: item.story.coverImageUrl,
        createdAt: item.story.createdAt,
        reactions: reactionCountsMap.get(item.storyId) || { like: 0, lol: 0, vibe: 0 },
        stickers,
      };
    });

    return {
      collection: collectionData,
      stories,
    };
  } catch (error) {
    logger.error('[StoryCollection] Failed to get collection', { error, collectionId });
    throw error;
  }
}

/**
 * Get user's collections
 */
export async function getUserCollections(userId: string): Promise<StoryCollection[]> {
  try {
    const collections = await prisma.storyCollection.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return collections.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      description: c.description,
      isPublic: c.isPublic,
      createdAt: c.createdAt,
    }));
  } catch (error) {
    logger.error('[StoryCollection] Failed to get user collections', { error, userId });
    throw error;
  }
}

/**
 * Get public collections
 */
export async function getPublicCollections(): Promise<StoryCollection[]> {
  try {
    const collections = await prisma.storyCollection.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return collections.map((c) => ({
      id: c.id,
      userId: c.userId,
      name: c.name,
      description: c.description,
      isPublic: c.isPublic,
      createdAt: c.createdAt,
    }));
  } catch (error) {
    logger.error('[StoryCollection] Failed to get public collections', { error });
    throw error;
  }
}

