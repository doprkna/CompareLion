/**
 * AURE Integration for Photo Challenge
 * Links PhotoChallengeEntry with RatingRequest and computes smart scores
 * v0.38.11 - Challenge Integration with AURE
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createRatingRequest, getRatingResult, RatingMetrics } from '@/lib/rating/ratingService';
import { SCORING_WEIGHTS, NORMALIZATION } from './scoringConfig';

export interface ChallengeEntryScore {
  finalScore: number;
  humanScore: number;
  aiScore: number;
  hasAiRating: boolean;
  humanScoreNorm: number;
  aiScoreNorm: number;
}

/**
 * Find RatingRequest for a PhotoChallengeEntry
 * Uses mapping via imageUrl + category + userId
 */
async function findRatingRequestForEntry(entryId: string): Promise<string | null> {
  try {
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      select: {
        imageUrl: true,
        category: true,
        userId: true,
      },
    });

    if (!entry) {
      return null;
    }

    // Find RatingRequest matching imageUrl + category + userId
    const ratingRequest = await prisma.ratingRequest.findFirst({
      where: {
        imageUrl: entry.imageUrl,
        category: entry.category,
        userId: entry.userId,
      },
      select: { id: true },
      orderBy: { createdAt: 'desc' }, // Get most recent if multiple
    });

    return ratingRequest?.id || null;
  } catch (error) {
    logger.error('[AUREIntegration] Failed to find rating request', { entryId, error });
    return null;
  }
}

/**
 * Ensure a rating exists for an entry
 * Creates RatingRequest if not found, then generates rating
 */
export async function ensureEntryRating(entryId: string): Promise<string | null> {
  try {
    // Check if rating already exists
    const existingRequestId = await findRatingRequestForEntry(entryId);
    if (existingRequestId) {
      return existingRequestId;
    }

    // Get entry details
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      select: {
        imageUrl: true,
        category: true,
        userId: true,
      },
    });

    if (!entry) {
      logger.warn('[AUREIntegration] Entry not found', { entryId });
      return null;
    }

    // Create RatingRequest
    const request = await createRatingRequest(
      entry.userId,
      entry.category,
      entry.imageUrl,
      undefined // No text for photo challenges
    );

    // Generate rating (this will be async/stub for now)
    try {
      await getRatingResult(request.id);
    } catch (error) {
      logger.warn('[AUREIntegration] Failed to generate rating immediately', { requestId: request.id, error });
      // Continue anyway - rating can be generated later
    }

    return request.id;
  } catch (error) {
    logger.error('[AUREIntegration] Failed to ensure entry rating', { entryId, error });
    return null;
  }
}

/**
 * Get AI score from RatingResult metrics
 * Normalizes metrics to 0-100 score
 */
function computeAiScore(metrics: RatingMetrics): number {
  // Use visualAppeal and creativity if available, otherwise average all metrics
  const visualAppeal = metrics.visualAppeal ?? 0;
  const creativity = metrics.creativity ?? 0;
  
  if (visualAppeal > 0 || creativity > 0) {
    // Average of visualAppeal and creativity
    return (visualAppeal + creativity) / 2;
  }
  
  // Fallback: average all metrics
  const values = Object.values(metrics).filter(v => typeof v === 'number') as number[];
  if (values.length === 0) {
    return 0;
  }
  
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Normalize human score to 0-100 range
 */
function normalizeHumanScore(humanScore: number): number {
  return Math.min(100, (humanScore / NORMALIZATION.maxHumanVotes) * 100);
}

/**
 * Get challenge entry score combining human votes and AI metrics
 */
export async function getChallengeEntryScore(entryId: string): Promise<ChallengeEntryScore> {
  try {
    // Get human votes
    const [appealCount, creativityCount] = await Promise.all([
      prisma.photoVote.count({
        where: {
          entryId,
          voteType: 'appeal',
        },
      }),
      prisma.photoVote.count({
        where: {
          entryId,
          voteType: 'creativity',
        },
      }),
    ]);

    const humanScore = appealCount + creativityCount;
    const humanScoreNorm = normalizeHumanScore(humanScore);

    // Try to get AI rating
    const ratingRequestId = await findRatingRequestForEntry(entryId);
    let aiScore = 0;
    let aiScoreNorm = 0;
    let hasAiRating = false;

    if (ratingRequestId) {
      try {
        const ratingResult = await getRatingResult(ratingRequestId);
        aiScore = computeAiScore(ratingResult.metrics);
        aiScoreNorm = aiScore; // Already 0-100
        hasAiRating = true;
      } catch (error) {
        logger.warn('[AUREIntegration] Failed to get rating result', { ratingRequestId, error });
        // Continue with human score only
      }
    }

    // Compute final score
    const finalScore = hasAiRating
      ? humanScoreNorm * SCORING_WEIGHTS.humanVotesWeight + aiScoreNorm * SCORING_WEIGHTS.aiScoreWeight
      : humanScoreNorm; // If no AI rating, use human score only

    return {
      finalScore: Math.round(finalScore * 100) / 100, // Round to 2 decimals
      humanScore,
      aiScore: Math.round(aiScore * 100) / 100,
      hasAiRating,
      humanScoreNorm: Math.round(humanScoreNorm * 100) / 100,
      aiScoreNorm: Math.round(aiScoreNorm * 100) / 100,
    };
  } catch (error) {
    logger.error('[AUREIntegration] Failed to get challenge entry score', { entryId, error });
    // Return fallback score
    return {
      finalScore: 0,
      humanScore: 0,
      aiScore: 0,
      hasAiRating: false,
      humanScoreNorm: 0,
      aiScoreNorm: 0,
    };
  }
}

