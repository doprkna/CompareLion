/**
 * Story Challenge Service
 * Handles story challenges and entries
 * v0.40.8 - Story Challenges 1.0 (Community Story Prompts)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { createNotification } from '@parel/notifications';
import { getStickerById } from './stickers';

export interface StoryChallenge {
  id: string;
  title: string;
  description: string;
  promptType: 'image' | 'story' | 'extended';
  startAt: Date;
  endAt: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface ChallengeEntry {
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
 * Get active and upcoming story challenges
 * Auto-deactivates expired challenges (lazy)
 */
export async function getActiveStoryChallenges(): Promise<StoryChallenge[]> {
  try {
    const now = new Date();
    
    // Get all active challenges
    const challenges = await prisma.storyChallenge.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        startAt: 'asc',
      },
    });

    // Lazy deactivation: mark expired challenges as inactive
    const expiredIds: string[] = [];
    const activeChallenges: StoryChallenge[] = [];

    for (const challenge of challenges) {
      if (now > challenge.endAt) {
        expiredIds.push(challenge.id);
      } else {
        activeChallenges.push({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          promptType: challenge.promptType as 'image' | 'story' | 'extended',
          startAt: challenge.startAt,
          endAt: challenge.endAt,
          isActive: challenge.isActive,
          createdAt: challenge.createdAt,
        });
      }
    }

    // Batch update expired challenges
    if (expiredIds.length > 0) {
      await prisma.storyChallenge.updateMany({
        where: {
          id: { in: expiredIds },
        },
        data: {
          isActive: false,
        },
      });
    }

    return activeChallenges;
  } catch (error) {
    logger.error('[StoryChallenge] Failed to get active challenges', { error });
    throw error;
  }
}

/**
 * Submit story to challenge
 */
export async function submitStoryToChallenge(
  userId: string,
  storyId: string,
  challengeId: string
): Promise<void> {
  try {
    // Validate challenge exists and is active
    const challenge = await prisma.storyChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (!challenge.isActive) {
      throw new Error('Challenge is not active');
    }

    const now = new Date();
    if (now < challenge.startAt) {
      throw new Error('Challenge has not started yet');
    }

    if (now > challenge.endAt) {
      throw new Error('Challenge has ended');
    }

    // Validate story belongs to user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true, status: true, visibility: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.userId !== userId) {
      throw new Error('Unauthorized: Story does not belong to user');
    }

    // Only published stories can enter challenges
    if (story.status !== 'published') {
      throw new Error('Only published stories can be submitted to challenges');
    }

    // Only public stories can enter challenges
    if (story.visibility !== 'public') {
      throw new Error('Only public stories can be submitted to challenges');
    }

    // Check if already submitted
    const existing = await prisma.storyChallengeEntry.findFirst({
      where: {
        challengeId,
        storyId,
      },
    });

    if (existing) {
      throw new Error('Story already submitted to this challenge');
    }

    // Create entry
    await prisma.storyChallengeEntry.create({
      data: {
        challengeId,
        storyId,
        userId,
      },
    });

    // Notify story owner (v0.40.17)
    // Note: Only notify if story owner submitted their own story to challenge
    // (Challenge owner notifications postponed until proper ownership exists)
    try {
      if (story.userId === userId) {
        await createNotification(userId, 'challenge_entry', {
          challengeId,
          storyId,
        });
      }
    } catch (error) {
      logger.error('[StoryChallenge] Failed to create challenge entry notification', {
        error,
        challengeId,
        storyId,
        userId,
      });
    }
  } catch (error) {
    logger.error('[StoryChallenge] Failed to submit story to challenge', {
      error,
      userId,
      storyId,
      challengeId,
    });
    throw error;
  }
}

/**
 * Get challenge entries with story details
 */
export async function getChallengeEntries(
  challengeId: string
): Promise<ChallengeEntry[]> {
  try {
    // Validate challenge exists
    const challenge = await prisma.storyChallenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Get entries (only published stories)
    const entries = await prisma.storyChallengeEntry.findMany({
      where: {
        challengeId,
        story: {
          status: 'published', // Only show published stories (v0.40.13)
        },
      },
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
        createdAt: 'desc',
      },
    });

    // Get story IDs for reaction/sticker aggregation
    const storyIds = entries.map((e) => e.storyId);

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

    // Get sticker counts (parse sticker types)
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
      const stickerId = r.type.substring(8); // Remove "sticker:" prefix
      const stickerMap = stickerCountsMap.get(r.storyId) || new Map();
      stickerMap.set(stickerId, r._count.id);
      stickerCountsMap.set(r.storyId, stickerMap);
    });

    // Build entries with reactions and stickers
    const result: ChallengeEntry[] = entries.map((entry) => {
      const stickerMap = stickerCountsMap.get(entry.storyId) || new Map();
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
        storyId: entry.storyId,
        userId: entry.userId,
        user: {
          id: entry.story.user.id,
          name: entry.story.user.name,
          username: entry.story.user.username,
        },
        coverImageUrl: entry.story.coverImageUrl,
        createdAt: entry.createdAt,
        reactions: reactionCountsMap.get(entry.storyId) || { like: 0, lol: 0, vibe: 0 },
        stickers,
      };
    });

    return result;
  } catch (error) {
    logger.error('[StoryChallenge] Failed to get challenge entries', { error, challengeId });
    throw error;
  }
}

