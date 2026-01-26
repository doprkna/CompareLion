/**
 * Story Ranking Service
 * Compute ranking scores for story feed
 * v0.40.16 - Story Feed Ranking 1.0 (Simple Sorting Logic)
 */

import { logger } from '@parel/core';
import { cacheGet, cacheSet } from '@parel/core/cache';

export interface StoryRankingData {
  id: string;
  createdAt: Date;
  viewCount: number;
  reactions: {
    like: number;
    lol: number;
    vibe: number;
  };
  stickers: Array<{
    count: number;
  }>;
  inChallenges: string[]; // Array of challenge IDs
  activeChallenges?: string[]; // Array of active challenge IDs (optional)
}

/**
 * Compute story rank score
 * Formula: recentness + (reactionTotal * 2) + (stickerTotal) + challengeBoost
 */
export function computeStoryRankScore(
  story: StoryRankingData,
  activeChallengeIds: string[] = []
): number {
  try {
    // A) Recency Boost
    const now = new Date();
    const createdAt = new Date(story.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const recentness = Math.max(0, 100 - hoursDiff); // 0 after ~4 days

    // B) Reaction Total
    const reactionTotal =
      (story.reactions.like || 0) +
      (story.reactions.lol || 0) +
      (story.reactions.vibe || 0);

    // C) Sticker Total
    const stickerTotal = story.stickers.reduce((sum, sticker) => sum + (sticker.count || 0), 0);

    // D) Challenge Boost
    let challengeBoost = 0;
    if (story.inChallenges && story.inChallenges.length > 0) {
      // Check if story is in any active challenges
      const hasActiveChallenge = story.inChallenges.some((challengeId) =>
        activeChallengeIds.includes(challengeId)
      );

      if (hasActiveChallenge) {
        challengeBoost = 20; // Active challenge boost
      } else {
        challengeBoost = 5; // Past challenge boost
      }
    }

    // E) Final Score
    const finalScore =
      recentness +
      story.viewCount * 0.5 +
      reactionTotal * 2 +
      stickerTotal * 1 +
      challengeBoost;

    return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    logger.error('[StoryRanking] Failed to compute rank score', { error, storyId: story.id });
    return 0;
  }
}

/**
 * Get active challenge IDs (challenges that are currently active)
 * Cached for 5 minutes to reduce database load
 */
export async function getActiveChallengeIds(): Promise<string[]> {
  // Try cache first
  const cached = await cacheGet<string[]>('challenge:active-ids');
  if (cached !== null) {
    return cached;
  }

  // TODO-PHASE2: Query active challenges from database
  // For now, return empty array (no active challenges)
  // In production: return challenge IDs where status = 'active' and endDate > now
  const activeIds: string[] = [];
  
  // Cache result for 5 minutes (fallback-safe: returns false if Redis unavailable)
  await cacheSet('challenge:active-ids', activeIds, 300);
  
  return activeIds;
}

