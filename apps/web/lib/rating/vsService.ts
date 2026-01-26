/**
 * VS Mode Service
 * Two-item comparison and voting
 * v0.38.16 - VS Mode
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { RatingMetrics, createRatingRequest, getRatingResult } from './ratingService';

export interface MetricComparison {
  id: string;
  label: string;
  left: number;
  right: number;
  winner: 'left' | 'right' | 'tie';
}

export interface VsComparisonResult {
  vsId: string;
  winner: 'left' | 'right' | 'tie';
  metrics: MetricComparison[];
  leftResult: {
    requestId: string;
    metrics: RatingMetrics;
    summary: string;
    roast: string;
    imageUrl: string | null;
  };
  rightResult: {
    requestId: string;
    metrics: RatingMetrics;
    summary: string;
    roast: string;
    imageUrl: string | null;
  };
  userVote?: 'left' | 'right';
  voteCounts: {
    left: number;
    right: number;
  };
}

/**
 * Compare two rating results
 * Computes winner per metric and overall winner
 * 
 * @param leftRequestId - Left item rating request ID
 * @param rightRequestId - Right item rating request ID
 * @returns Comparison result
 */
export async function compareTwoItems(
  leftRequestId: string,
  rightRequestId: string
): Promise<{
  winner: 'left' | 'right' | 'tie';
  metrics: MetricComparison[];
}> {
  try {
    // Fetch both rating results
    const [leftResult, rightResult] = await Promise.all([
      prisma.ratingResult.findUnique({
        where: { requestId: leftRequestId },
        include: {
          request: {
            select: {
              imageUrl: true,
            },
          },
        },
      }),
      prisma.ratingResult.findUnique({
        where: { requestId: rightRequestId },
        include: {
          request: {
            select: {
              imageUrl: true,
            },
          },
        },
      }),
    ]);

    if (!leftResult || !rightResult) {
      throw new Error('One or both rating results not found');
    }

    const leftMetrics = leftResult.metrics as RatingMetrics;
    const rightMetrics = rightResult.metrics as RatingMetrics;

    // Get all metric keys (union of both)
    const allMetricKeys = new Set([
      ...Object.keys(leftMetrics),
      ...Object.keys(rightMetrics),
    ]);

    // Compare each metric
    const metricComparisons: MetricComparison[] = [];
    let leftWins = 0;
    let rightWins = 0;
    let ties = 0;

    for (const metricId of allMetricKeys) {
      const leftValue = leftMetrics[metricId] || 0;
      const rightValue = rightMetrics[metricId] || 0;

      let winner: 'left' | 'right' | 'tie';
      if (leftValue > rightValue) {
        winner = 'left';
        leftWins++;
      } else if (rightValue > leftValue) {
        winner = 'right';
        rightWins++;
      } else {
        winner = 'tie';
        ties++;
      }

      metricComparisons.push({
        id: metricId,
        label: metricId.replace(/([A-Z])/g, ' $1').trim(),
        left: Math.round(leftValue),
        right: Math.round(rightValue),
        winner,
      });
    }

    // Determine overall winner
    let overallWinner: 'left' | 'right' | 'tie';
    if (leftWins > rightWins) {
      overallWinner = 'left';
    } else if (rightWins > leftWins) {
      overallWinner = 'right';
    } else {
      // Tie - use total score as tiebreaker
      const leftTotal = Object.values(leftMetrics).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      const rightTotal = Object.values(rightMetrics).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
      
      if (leftTotal > rightTotal) {
        overallWinner = 'left';
      } else if (rightTotal > leftTotal) {
        overallWinner = 'right';
      } else {
        overallWinner = 'tie';
      }
    }

    return {
      winner: overallWinner,
      metrics: metricComparisons,
    };
  } catch (error) {
    logger.error('[VsService] Failed to compare items', {
      leftRequestId,
      rightRequestId,
      error,
    });
    throw error;
  }
}

/**
 * Get full VS comparison result
 * 
 * @param vsId - VS request ID
 * @param userId - Optional user ID for vote state
 * @returns Full comparison result
 */
export async function getVsComparison(
  vsId: string,
  userId?: string
): Promise<VsComparisonResult | null> {
  try {
    const vsRequest = await prisma.vsRequest.findUnique({
      where: { id: vsId },
      include: {
        leftRequest: {
          include: {
            result: true,
          },
        },
        rightRequest: {
          include: {
            result: true,
          },
        },
      },
    });

    if (!vsRequest) {
      return null;
    }

    if (!vsRequest.leftRequest.result || !vsRequest.rightRequest.result) {
      throw new Error('Rating results not found for one or both items');
    }

    // Get comparison
    const comparison = await compareTwoItems(
      vsRequest.leftRequestId,
      vsRequest.rightRequestId
    );

    // Get user vote if userId provided
    let userVote: 'left' | 'right' | undefined;
    if (userId) {
      const vote = await prisma.vsVote.findUnique({
        where: {
          vsId_userId: {
            vsId,
            userId,
          },
        },
      });
      if (vote) {
        userVote = vote.choice;
      }
    }

    // Get vote counts
    const [leftVotes, rightVotes] = await Promise.all([
      prisma.vsVote.count({
        where: {
          vsId,
          choice: 'left',
        },
      }),
      prisma.vsVote.count({
        where: {
          vsId,
          choice: 'right',
        },
      }),
    ]);

    return {
      vsId: vsRequest.id,
      winner: comparison.winner,
      metrics: comparison.metrics,
      leftResult: {
        requestId: vsRequest.leftRequestId,
        metrics: vsRequest.leftRequest.result.metrics as RatingMetrics,
        summary: vsRequest.leftRequest.result.summaryText,
        roast: vsRequest.leftRequest.result.roastText,
        imageUrl: vsRequest.leftRequest.imageUrl,
      },
      rightResult: {
        requestId: vsRequest.rightRequestId,
        metrics: vsRequest.rightRequest.result.metrics as RatingMetrics,
        summary: vsRequest.rightRequest.result.summaryText,
        roast: vsRequest.rightRequest.result.roastText,
        imageUrl: vsRequest.rightRequest.imageUrl,
      },
      userVote,
      voteCounts: {
        left: leftVotes,
        right: rightVotes,
      },
    };
  } catch (error) {
    logger.error('[VsService] Failed to get VS comparison', { vsId, error });
    throw error;
  }
}

/**
 * Vote on a VS comparison
 * 
 * @param userId - User ID
 * @param vsId - VS request ID
 * @param choice - User's choice: "left" or "right"
 * @returns Vote result with updated counts
 */
export async function voteOnVs(
  userId: string,
  vsId: string,
  choice: 'left' | 'right'
): Promise<{
  success: boolean;
  choice: 'left' | 'right';
  voteCounts: {
    left: number;
    right: number;
  };
}> {
  try {
    // Verify VS request exists
    const vsRequest = await prisma.vsRequest.findUnique({
      where: { id: vsId },
      select: { id: true },
    });

    if (!vsRequest) {
      throw new Error('VS request not found');
    }

    // Check if user already voted
    const existingVote = await prisma.vsVote.findUnique({
      where: {
        vsId_userId: {
          vsId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote if different
      if (existingVote.choice !== choice) {
        await prisma.vsVote.update({
          where: {
            vsId_userId: {
              vsId,
              userId,
            },
          },
          data: { choice },
        });
      }
    } else {
      // Create new vote
      await prisma.vsVote.create({
        data: {
          vsId,
          userId,
          choice,
        },
      });
    }

    // Get updated vote counts
    const [leftVotes, rightVotes] = await Promise.all([
      prisma.vsVote.count({
        where: {
          vsId,
          choice: 'left',
        },
      }),
      prisma.vsVote.count({
        where: {
          vsId,
          choice: 'right',
        },
      }),
    ]);

    return {
      success: true,
      choice,
      voteCounts: {
        left: leftVotes,
        right: rightVotes,
      },
    };
  } catch (error: any) {
    logger.error('[VsService] Failed to vote on VS', { userId, vsId, choice, error });
    throw error;
  }
}

/**
 * Create a VS comparison
 * Creates two rating requests and one VS request
 * 
 * @param userId - User ID
 * @param leftImageUrl - Left item image URL
 * @param rightImageUrl - Right item image URL
 * @param category - Category for both items
 * @returns Created VS request ID
 */
export async function createVsComparison(
  userId: string,
  leftImageUrl: string,
  rightImageUrl: string,
  category: string
): Promise<{ vsId: string }> {
  try {
    // Create two rating requests
    const [leftRequest, rightRequest] = await Promise.all([
      createRatingRequest(userId, category, leftImageUrl),
      createRatingRequest(userId, category, rightImageUrl),
    ]);

    // Generate ratings for both
    const [leftResult, rightResult] = await Promise.all([
      getRatingResult(leftRequest.id),
      getRatingResult(rightRequest.id),
    ]);

    // Create VS request
    const vsRequest = await prisma.vsRequest.create({
      data: {
        userId,
        leftRequestId: leftRequest.id,
        rightRequestId: rightRequest.id,
      },
    });

    return { vsId: vsRequest.id };
  } catch (error) {
    logger.error('[VsService] Failed to create VS comparison', {
      userId,
      category,
      error,
    });
    throw error;
  }
}

