/**
 * Story Feed Service
 * Handles story feed queries and reactions
 * v0.40.7 - Story Publishing & Visibility Controls 1.0
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { parseStickerType, formatStickerType, getStickerById } from './stickers';
import { computeStoryRankScore, getActiveChallengeIds, type StoryRankingData } from './storyRankingService';
import { getStoryChallenges } from './storyAnalyticsService';
import { getActiveStoryChallenges } from './storyChallengeService';
import { createNotification } from '@parel/notifications';

export type StoryVisibility = 'public' | 'private' | 'friends';

export interface StoryFeedParams {
  limit?: number;
  cursor?: string;
  createdBefore?: Date;
  sort?: 'ranked' | 'latest'; // v0.40.16 - Ranking support
}

export interface StorySticker {
  id: string;
  emoji: string;
  count: number;
}

export interface StoryFeedItem {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
  };
  type: string;
  coverImageUrl: string | null;
  exportId: string | null;
  createdAt: Date;
  reactions: {
    like: number;
    lol: number;
    vibe: number;
  };
  stickers: StorySticker[];
  remixMetadata?: {
    parentStoryId: string;
    parentAuthor: {
      id: string;
      name: string | null;
      username: string | null;
    };
    remixType: string;
  } | null;
}

export interface StoryFeedResponse {
  stories: StoryFeedItem[];
  nextCursor: string | null;
}

/**
 * Get public stories feed
 */
export async function getPublicStoriesFeed(
  params: StoryFeedParams = {}
): Promise<StoryFeedResponse> {
  const limit = params.limit || 20;
  const sort = params.sort || 'ranked'; // v0.40.16 - Default to ranked
  const createdBefore = params.cursor
    ? new Date(params.cursor)
    : params.createdBefore || new Date();

  try {
    // For ranked feed, fetch ~100 stories to rank, then return top N
    // For latest feed, use existing logic (limit + 1)
    const fetchLimit = sort === 'ranked' ? 100 : limit + 1;

    const stories = await prisma.story.findMany({
      where: {
        status: 'published', // Only show published stories (v0.40.13)
        visibility: 'public', // Only show public stories in feed
        createdAt: {
          lt: createdBefore,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        parentStory: {
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
        createdAt: 'desc',
      },
      take: fetchLimit,
    });

    // Get reaction counts for each story
    const storyIds = stories.map((s) => s.id);
    const reactions = await prisma.storyReaction.groupBy({
      by: ['storyId', 'type'],
      where: {
        storyId: {
          in: storyIds,
        },
      },
      _count: {
        id: true,
      },
    });

    // Build reaction counts map
    const reactionCountsMap = new Map<string, { like: number; lol: number; vibe: number }>();
    const stickerCountsMap = new Map<string, Map<string, number>>(); // storyId -> stickerId -> count
    
    storyIds.forEach((id) => {
      reactionCountsMap.set(id, { like: 0, lol: 0, vibe: 0 });
      stickerCountsMap.set(id, new Map());
    });

    reactions.forEach((r) => {
      const stickerId = parseStickerType(r.type);
      if (stickerId) {
        // Sticker reaction
        const stickerMap = stickerCountsMap.get(r.storyId) || new Map();
        stickerMap.set(stickerId, r._count.id);
        stickerCountsMap.set(r.storyId, stickerMap);
      } else {
        // Standard reaction
        const counts = reactionCountsMap.get(r.storyId) || { like: 0, lol: 0, vibe: 0 };
        if (r.type === 'like') counts.like = r._count.id;
        if (r.type === 'lol') counts.lol = r._count.id;
        if (r.type === 'vibe') counts.vibe = r._count.id;
        reactionCountsMap.set(r.storyId, counts);
      }
    });

    // Get view counts for ranking (v0.40.16)
    const viewCounts = await prisma.storyView.groupBy({
      by: ['storyId'],
      where: {
        storyId: { in: storyIds },
      },
      _count: { id: true },
    });

    const viewCountMap = new Map<string, number>();
    viewCounts.forEach((vc) => {
      viewCountMap.set(vc.storyId, vc._count.id);
    });

    // Get challenge participation for ranking (v0.40.16)
    const challengeEntries = await prisma.storyChallengeEntry.findMany({
      where: {
        storyId: { in: storyIds },
      },
      select: {
        storyId: true,
        challengeId: true,
      },
    });

    const storyChallengeMap = new Map<string, string[]>();
    challengeEntries.forEach((entry) => {
      const existing = storyChallengeMap.get(entry.storyId) || [];
      existing.push(entry.challengeId);
      storyChallengeMap.set(entry.storyId, existing);
    });

    // Get active challenge IDs for ranking boost
    const activeChallenges = await getActiveStoryChallenges();
    const activeChallengeIds = activeChallenges.map((c) => c.id);

    // Build feed items with ranking scores (v0.40.16)
    const feedItemsWithScores: Array<StoryFeedItem & { rankScore: number }> = stories.map((story) => {
      const stickerMap = stickerCountsMap.get(story.id) || new Map();
      const stickers: StorySticker[] = Array.from(stickerMap.entries())
        .map(([stickerId, count]) => {
          const sticker = getStickerById(stickerId);
          if (!sticker) return null;
          return {
            id: stickerId,
            emoji: sticker.emoji,
            count,
          };
        })
        .filter((s): s is StorySticker => s !== null)
        .sort((a, b) => b.count - a.count); // Sort by count descending

      const reactions = reactionCountsMap.get(story.id) || { like: 0, lol: 0, vibe: 0 };
      const viewCount = viewCountMap.get(story.id) || 0;
      const challengeIds = storyChallengeMap.get(story.id) || [];

      // Compute rank score (v0.40.16)
      const rankScore = computeStoryRankScore(
        {
          id: story.id,
          createdAt: story.createdAt,
          viewCount,
          reactions,
          stickers,
          inChallenges: challengeIds,
        },
        activeChallengeIds
      );

      return {
        id: story.id,
        userId: story.userId,
        user: {
          id: story.user.id,
          name: story.user.name,
          username: story.user.username,
        },
        type: story.type,
        coverImageUrl: story.coverImageUrl,
        exportId: story.exportId,
        createdAt: story.createdAt,
        reactions,
        stickers,
        remixMetadata: story.parentStoryId && story.parentStory
          ? {
              parentStoryId: story.parentStoryId,
              parentAuthor: {
                id: story.parentStory.user.id,
                name: story.parentStory.user.name,
                username: story.parentStory.user.username,
              },
              remixType: story.remixType || 'extend',
            }
          : null,
        audioType: story.audioType || null,
        audioTagId: story.audioTagId || null,
        audioUrl: story.audioUrl || null,
        rankScore,
        viewCount,
      };
    });

    // Sort by rank score if ranked, otherwise keep chronological (v0.40.16)
    let sortedItems: StoryFeedItem[];
    if (sort === 'ranked') {
      sortedItems = feedItemsWithScores.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
    } else {
      sortedItems = feedItemsWithScores; // Already sorted by createdAt desc
    }

    // Return top N items
    const storiesToReturn = sortedItems.slice(0, limit);
    const hasMore = sortedItems.length > limit;

    const nextCursor = hasMore && storiesToReturn.length > 0
      ? storiesToReturn[storiesToReturn.length - 1].createdAt.toISOString()
      : null;

    return {
      stories: feedItems,
      nextCursor,
    };
  } catch (error) {
    logger.error('[StoryFeed] Failed to get public stories feed', { error, params });
    throw error;
  }
}

/**
 * Add or remove story reaction (toggle for standard reactions, add for stickers)
 */
export async function handleStoryReaction(
  userId: string,
  storyId: string,
  type: string,
  action: 'toggle' | 'add' = 'toggle'
): Promise<{
  reactions: { like: number; lol: number; vibe: number };
  stickers: StorySticker[];
}> {
  try {
    const stickerId = parseStickerType(type);
    const isSticker = stickerId !== null;

    if (isSticker) {
      // Sticker: always add (no toggle)
      const reactionType = formatStickerType(stickerId);
      await prisma.storyReaction.create({
        data: {
          storyId,
          userId,
          type: reactionType,
        },
      });

      // Notify story owner (v0.40.17)
      try {
        const story = await prisma.story.findUnique({
          where: { id: storyId },
          select: { userId: true },
        });
        if (story && story.userId !== userId) {
          await createNotification(story.userId, 'story_sticker', {
            storyId,
            stickerId,
          });
        }
      } catch (error) {
        logger.error('[StoryFeed] Failed to create sticker notification', { error, storyId, userId });
      }
    } else {
      // Standard reaction: toggle behavior
      if (type !== 'like' && type !== 'lol' && type !== 'vibe') {
        throw new Error(`Invalid reaction type: ${type}`);
      }

      const existing = await prisma.storyReaction.findUnique({
        where: {
          storyId_userId_type: {
            storyId,
            userId,
            type,
          },
        },
      });

      if (existing) {
        // Remove reaction
        await prisma.storyReaction.delete({
          where: {
            id: existing.id,
          },
        });
      } else {
        // Add reaction
        await prisma.storyReaction.create({
          data: {
            storyId,
            userId,
            type,
          },
        });

        // Notify story owner (v0.40.17)
        try {
          const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: { userId: true },
          });
          if (story && story.userId !== userId) {
            await createNotification(story.userId, 'story_reaction', {
              storyId,
              reactionType: type,
            });
          }
        } catch (error) {
          logger.error('[StoryFeed] Failed to create reaction notification', { error, storyId, userId });
        }
      }
    }

    // Get updated counts
    return await getStoryReactionSummary(storyId);
  } catch (error) {
    logger.error('[StoryFeed] Failed to handle story reaction', { error, userId, storyId, type, action });
    throw error;
  }
}

/**
 * Get reaction and sticker summary for a story
 */
export async function getStoryReactionSummary(storyId: string): Promise<{
  reactions: { like: number; lol: number; vibe: number };
  stickers: StorySticker[];
}> {
  const reactions = await prisma.storyReaction.groupBy({
    by: ['type'],
    where: {
      storyId,
    },
    _count: {
      id: true,
    },
  });

  const reactionCounts = { like: 0, lol: 0, vibe: 0 };
  const stickerCounts = new Map<string, number>();

  reactions.forEach((r) => {
    const stickerId = parseStickerType(r.type);
    if (stickerId) {
      stickerCounts.set(stickerId, r._count.id);
    } else {
      if (r.type === 'like') reactionCounts.like = r._count.id;
      if (r.type === 'lol') reactionCounts.lol = r._count.id;
      if (r.type === 'vibe') reactionCounts.vibe = r._count.id;
    }
  });

  const stickers: StorySticker[] = Array.from(stickerCounts.entries())
    .map(([stickerId, count]) => {
      const sticker = getStickerById(stickerId);
      if (!sticker) return null;
      return {
        id: stickerId,
        emoji: sticker.emoji,
        count,
      };
    })
    .filter((s): s is StorySticker => s !== null)
    .sort((a, b) => b.count - a.count);

  return {
    reactions: reactionCounts,
    stickers,
  };
}

/**
 * Legacy function for backward compatibility
 */
export async function toggleStoryReaction(
  userId: string,
  storyId: string,
  type: 'like' | 'lol' | 'vibe'
): Promise<{ like: number; lol: number; vibe: number }> {
  const result = await handleStoryReaction(userId, storyId, type, 'toggle');
  return result.reactions;
}

/**
 * Publish story with visibility setting
 */
export async function publishStory(
  userId: string,
  storyId: string,
  visibility: StoryVisibility
): Promise<{
  id: string;
  visibility: string;
  publishedAt: Date | null;
}> {
  try {
    // Verify ownership
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true, publishedAt: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.userId !== userId) {
      throw new Error('Unauthorized: Only story owner can publish');
    }

    // For now, "friends" behaves like "private" but we store the value
    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        visibility,
        publishedAt: story.publishedAt || new Date(), // Set if not already set
      },
      select: {
        id: true,
        visibility: true,
        publishedAt: true,
      },
    });

    return updated;
  } catch (error) {
    logger.error('[StoryFeed] Failed to publish story', { error, userId, storyId, visibility });
    throw error;
  }
}

/**
 * Update story visibility
 */
export async function updateStoryVisibility(
  userId: string,
  storyId: string,
  visibility: StoryVisibility
): Promise<{
  id: string;
  visibility: string;
  publishedAt: Date | null;
}> {
  try {
    // Verify ownership
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true, publishedAt: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.userId !== userId) {
      throw new Error('Unauthorized: Only story owner can change visibility');
    }

    // Set publishedAt if it was null (first time publishing)
    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        visibility,
        publishedAt: story.publishedAt || new Date(),
      },
      select: {
        id: true,
        visibility: true,
        publishedAt: true,
      },
    });

    return updated;
  } catch (error) {
    logger.error('[StoryFeed] Failed to update story visibility', { error, userId, storyId, visibility });
    throw error;
  }
}

/**
 * Get user's own stories
 */
export async function getUserStories(userId: string): Promise<Array<{
  id: string;
  type: string;
  coverImageUrl: string | null;
  visibility: string;
  publishedAt: Date | null;
  createdAt: Date;
}>> {
  try {
    const stories = await prisma.story.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        type: true,
        coverImageUrl: true,
        visibility: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return stories;
  } catch (error) {
    logger.error('[StoryFeed] Failed to get user stories', { error, userId });
    throw error;
  }
}

