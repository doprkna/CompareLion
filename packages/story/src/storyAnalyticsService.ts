/**
 * Story Analytics Service
 * Lightweight creator analytics for stories
 * v0.40.12 - Story Analytics 1.0 (Views, Reactions, Engagement)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { getStoryReactionSummary } from './storyFeedService';
import { parseStickerType } from './stickers';

export interface StoryReactionStats {
  like: number;
  lol: number;
  vibe: number;
}

export interface StoryStickerStat {
  id: string;
  emoji: string;
  count: number;
}

export interface StoryAnalytics {
  viewCount: number;
  reactions: StoryReactionStats;
  stickers: StoryStickerStat[];
  reachScore: number;
  inChallenges: string[]; // Challenge IDs
}

// Session-based view tracking (6 hour window)
const VIEW_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Increment story view count
 * Simple session-based tracking (no per-view logging in 1.0)
 */
export async function incrementStoryView(
  storyId: string,
  userId?: string | null
): Promise<number> {
  try {
    // Verify story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, viewCount: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // If userId provided, check for recent view (6 hour window)
    if (userId) {
      // Check if user has viewed this story recently
      // We'll use a simple approach: check if user has any reaction in last 6 hours
      // This is a lightweight proxy for "has viewed recently"
      const recentReaction = await prisma.storyReaction.findFirst({
        where: {
          storyId,
          userId,
          createdAt: {
            gte: new Date(Date.now() - VIEW_WINDOW_MS),
          },
        },
        select: { id: true },
      });

      // If user has recent reaction, they've likely viewed recently
      // But we'll still increment for simplicity (coarse counting)
      // In future, could add StoryView table for precise tracking
    }

    // Increment view count
    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: { viewCount: true },
    });

    return updated.viewCount;
  } catch (error) {
    logger.error('[StoryAnalytics] Failed to increment story view', { error, storyId, userId });
    throw error;
  }
}

/**
 * Get story reaction stats
 * Reuses existing getStoryReactionSummary
 */
export async function getStoryReactionStats(storyId: string): Promise<StoryReactionStats> {
  try {
    const summary = await getStoryReactionSummary(storyId);
    return summary.reactions;
  } catch (error) {
    logger.error('[StoryAnalytics] Failed to get reaction stats', { error, storyId });
    return { like: 0, lol: 0, vibe: 0 };
  }
}

/**
 * Get story sticker stats
 * Returns top stickers sorted by count
 */
export async function getStoryStickerStats(storyId: string): Promise<StoryStickerStat[]> {
  try {
    const summary = await getStoryReactionSummary(storyId);
    return summary.stickers;
  } catch (error) {
    logger.error('[StoryAnalytics] Failed to get sticker stats', { error, storyId });
    return [];
  }
}

/**
 * Get challenge IDs that this story is part of
 */
export async function getStoryChallenges(storyId: string): Promise<string[]> {
  try {
    const entries = await prisma.storyChallengeEntry.findMany({
      where: { storyId },
      select: { challengeId: true },
    });

    return entries.map((e) => e.challengeId);
  } catch (error) {
    logger.error('[StoryAnalytics] Failed to get story challenges', { error, storyId });
    return [];
  }
}

/**
 * Calculate reach score for a story
 * Formula: viewCount + (reactions_total * 3) + (stickers_total * 2) + (isChallengeEntry ? 20 : 0)
 */
export async function calculateStoryReachScore(storyId: string): Promise<number> {
  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { viewCount: true },
    });

    if (!story) {
      return 0;
    }

    const reactions = await getStoryReactionStats(storyId);
    const stickers = await getStoryStickerStats(storyId);
    const challengeIds = await getStoryChallenges(storyId);

    const reactionsTotal = reactions.like + reactions.lol + reactions.vibe;
    const stickersTotal = stickers.reduce((sum, s) => sum + s.count, 0);
    const challengeBonus = challengeIds.length > 0 ? 20 : 0;

    const reachScore =
      story.viewCount + reactionsTotal * 3 + stickersTotal * 2 + challengeBonus;

    // Update story with calculated reach score
    await prisma.story.update({
      where: { id: storyId },
      data: { reachScore },
    });

    return reachScore;
  } catch (error) {
    logger.error('[StoryAnalytics] Failed to calculate reach score', { error, storyId });
    return 0;
  }
}

/**
 * Get aggregated analytics for a story
 */
export async function getStoryAnalytics(storyId: string): Promise<StoryAnalytics> {
  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        viewCount: true,
        reachScore: true,
      },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    const reactions = await getStoryReactionStats(storyId);
    const stickers = await getStoryStickerStats(storyId);
    const challengeIds = await getStoryChallenges(storyId);

    // Recalculate reach score if needed (or use cached)
    let reachScore = story.reachScore;
    if (reachScore === 0 || reachScore === null) {
      // Recalculate if not set
      reachScore = await calculateStoryReachScore(storyId);
    } else {
      // Verify it's still accurate (optional - could skip for performance)
      // For now, we'll trust cached value
    }

    return {
      viewCount: story.viewCount || 0,
      reactions,
      stickers,
      reachScore: reachScore || 0,
      inChallenges: challengeIds,
    };
  } catch (error) {
    logger.error('[StoryAnalytics] Failed to get story analytics', { error, storyId });
    throw error;
  }
}

