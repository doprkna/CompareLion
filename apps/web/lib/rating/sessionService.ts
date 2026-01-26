/**
 * Rating Session Service
 * Batch rating mode / "Tinder Mode" session flow
 * v0.38.17 - Batch Rating Mode
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { createRatingRequest, getRatingResult, RatingMetrics } from './ratingService';

export interface TasteProfile {
  metricsAvg: { [key: string]: number };
  strongPoints: string[];
  weakPoints: string[];
  aiSummary: string;
}

/**
 * Start a new rating session
 * Creates session and selects items from source pool
 * 
 * @param userId - User ID
 * @param category - Category or template ID
 * @param totalItems - Number of items to rate (5-20)
 * @returns Session ID
 */
export async function startRatingSession(
  userId: string,
  category: string,
  totalItems: number
): Promise<{ sessionId: string }> {
  try {
    // Validate totalItems
    const clampedTotal = Math.max(5, Math.min(20, totalItems));

    // Create session
    const session = await prisma.ratingSession.create({
      data: {
        userId,
        category,
        totalItemsPlanned: clampedTotal,
        totalItemsRated: 0,
      },
    });

    // Select items from source pool
    // For MVP: use challenge entries or create placeholder items
    // Simple approach: create session items with placeholder requestIds
    // They will be linked when user rates them
    const sessionItems = await Promise.all(
      Array.from({ length: clampedTotal }, async (_, index) => {
        return prisma.ratingSessionItem.create({
          data: {
            sessionId: session.id,
            index,
            skipped: false,
          },
        });
      })
    );

    logger.info('[SessionService] Started rating session', {
      sessionId: session.id,
      userId,
      category,
      totalItems: clampedTotal,
    });

    return { sessionId: session.id };
  } catch (error) {
    logger.error('[SessionService] Failed to start session', {
      userId,
      category,
      totalItems,
      error,
    });
    throw error;
  }
}

/**
 * Get next unrated item in session
 * Returns item data or null if session is complete
 * 
 * @param sessionId - Session ID
 * @param userId - User ID (for verification)
 * @returns Next item to rate or null
 */
export async function getNextSessionItem(
  sessionId: string,
  userId: string
): Promise<{
  sessionItemId: string;
  index: number;
  itemData: {
    imageUrl?: string;
    text?: string;
    category: string;
  } | null;
} | null> {
  try {
    // Verify session belongs to user
    const session = await prisma.ratingSession.findUnique({
      where: { id: sessionId },
      select: {
        userId: true,
        category: true,
        completedAt: true,
      },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Session not found or access denied');
    }

    if (session.completedAt) {
      return null; // Session already completed
    }

    // Find next unrated item (no requestId linked yet)
    const nextItem = await prisma.ratingSessionItem.findFirst({
      where: {
        sessionId,
        requestId: null,
      },
      orderBy: {
        index: 'asc',
      },
    });

    if (!nextItem) {
      return null; // All items rated
    }

    // For MVP: Generate item data on-the-fly
    // In production, this would fetch from challenge entries or item pool
    // For now, return placeholder that prompts user to upload/select
    return {
      sessionItemId: nextItem.id,
      index: nextItem.index,
      itemData: {
        category: session.category,
        // No imageUrl/text - user will provide during rating
      },
    };
  } catch (error) {
    logger.error('[SessionService] Failed to get next session item', {
      sessionId,
      userId,
      error,
    });
    throw error;
  }
}

/**
 * Complete rating for a session item
 * Links RatingRequest to session item and increments counter
 * 
 * @param sessionItemId - Session item ID
 * @param userId - User ID (for verification)
 * @param requestId - Rating request ID
 * @param skipped - Whether item was skipped
 * @returns Updated session state
 */
export async function completeRatingForItem(
  sessionItemId: string,
  userId: string,
  requestId: string | null,
  skipped: boolean = false
): Promise<{
  success: boolean;
  sessionId: string;
  totalItemsRated: number;
  totalItemsPlanned: number;
}> {
  try {
    // Get session item with session
    const sessionItem = await prisma.ratingSessionItem.findUnique({
      where: { id: sessionItemId },
      include: {
        session: {
          select: {
            userId: true,
            id: true,
            totalItemsRated: true,
            totalItemsPlanned: true,
          },
        },
      },
    });

    if (!sessionItem) {
      throw new Error('Session item not found');
    }

    if (sessionItem.session.userId !== userId) {
      throw new Error('Access denied');
    }

    // Update session item
    await prisma.ratingSessionItem.update({
      where: { id: sessionItemId },
      data: {
        requestId,
        skipped,
      },
    });

    // Increment totalItemsRated if not skipped or if requestId provided
    if (!skipped && requestId) {
      await prisma.ratingSession.update({
        where: { id: sessionItem.session.id },
        data: {
          totalItemsRated: {
            increment: 1,
          },
        },
      });

      // Record faction contribution for rating (fire-and-forget)
      import('@/lib/aure/interaction/battleService')
        .then(({ recordFactionContribution }) => {
          return recordFactionContribution(userId, 'rate', 1);
        })
        .catch((error) => {
          // Silently fail - faction battles are optional
          logger.debug('[SessionService] Failed to record faction contribution', { error, userId });
        });
    }

    // Get updated session
    const updatedSession = await prisma.ratingSession.findUnique({
      where: { id: sessionItem.session.id },
      select: {
        totalItemsRated: true,
        totalItemsPlanned: true,
      },
    });

    return {
      success: true,
      sessionId: sessionItem.session.id,
      totalItemsRated: updatedSession?.totalItemsRated || 0,
      totalItemsPlanned: updatedSession?.totalItemsPlanned || 0,
    };
  } catch (error) {
    logger.error('[SessionService] Failed to complete rating for item', {
      sessionItemId,
      userId,
      requestId,
      error,
    });
    throw error;
  }
}

/**
 * Finalize session and generate taste profile
 * Marks session as completed and computes taste profile
 * 
 * @param sessionId - Session ID
 * @param userId - User ID (for verification)
 * @returns Taste profile
 */
export async function finalizeSession(
  sessionId: string,
  userId: string
): Promise<TasteProfile> {
  try {
    // Verify session belongs to user
    const session = await prisma.ratingSession.findUnique({
      where: { id: sessionId },
      include: {
        items: {
          where: {
            skipped: false,
            requestId: { not: null },
          },
          include: {
            request: {
              include: {
                result: true,
              },
            },
          },
          orderBy: {
            index: 'asc',
          },
        },
      },
    });

    if (!session || session.userId !== userId) {
      throw new Error('Session not found or access denied');
    }

    if (session.completedAt) {
      // Already finalized, return existing profile
      // For MVP, we'll compute it fresh each time
    }

    // Collect all metrics from rated items
    const allMetrics: RatingMetrics[] = [];
    for (const item of session.items) {
      if (item.request?.result) {
        allMetrics.push(item.request.result.metrics as RatingMetrics);
      }
    }

    if (allMetrics.length === 0) {
      throw new Error('No rated items found in session');
    }

    // Compute average metrics
    const metricsAvg: { [key: string]: number } = {};
    const metricKeys = new Set<string>();
    
    // Collect all metric keys
    allMetrics.forEach((metrics) => {
      Object.keys(metrics).forEach((key) => metricKeys.add(key));
    });

    // Compute averages
    metricKeys.forEach((key) => {
      const sum = allMetrics.reduce((acc, metrics) => {
        return acc + (metrics[key] || 0);
      }, 0);
      metricsAvg[key] = sum / allMetrics.length;
    });

    // Find strong and weak points (top 2 and bottom 2 metrics)
    const sortedMetrics = Object.entries(metricsAvg)
      .sort(([, a], [, b]) => b - a)
      .map(([key]) => key);

    const strongPoints = sortedMetrics.slice(0, 2);
    const weakPoints = sortedMetrics.slice(-2).reverse();

    // Generate AI summary (simplified for MVP)
    // In production, this would call AI to generate personalized summary
    const aiSummary = `Based on your ${allMetrics.length} ratings, you tend to value ${strongPoints[0] || 'quality'} and ${strongPoints[1] || 'creativity'} most highly. Your taste profile shows a preference for items that score well in these areas.`;

    // Mark session as completed
    await prisma.ratingSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
      },
    });

    return {
      metricsAvg,
      strongPoints,
      weakPoints,
      aiSummary,
    };
  } catch (error) {
    logger.error('[SessionService] Failed to finalize session', {
      sessionId,
      userId,
      error,
    });
    throw error;
  }
}

/**
 * Get session summary (taste profile)
 * 
 * @param sessionId - Session ID
 * @param userId - User ID (for verification)
 * @returns Taste profile
 */
export async function getSessionSummary(
  sessionId: string,
  userId: string
): Promise<TasteProfile> {
  return finalizeSession(sessionId, userId);
}

