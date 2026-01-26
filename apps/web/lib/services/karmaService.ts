/**
 * Karma Service
 * Implements karma earning/losing logic for social profiles
 * v0.36.24 - Social Profiles 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Award karma for completing a question
 */
export async function awardKarmaForQuestion(userId: string): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        karma: { increment: 1 },
      },
      select: { karma: true },
    });

    logger.info(`[KarmaService] Awarded +1 karma for question to user ${userId}`);
    return user.karma;
  } catch (error) {
    logger.error('[KarmaService] Failed to award karma for question', { userId, error });
    throw error;
  }
}

/**
 * Award karma for completing a fight
 */
export async function awardKarmaForFight(userId: string): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        karma: { increment: 1 },
      },
      select: { karma: true },
    });

    logger.info(`[KarmaService] Awarded +1 karma for fight to user ${userId}`);
    return user.karma;
  } catch (error) {
    logger.error('[KarmaService] Failed to award karma for fight', { userId, error });
    throw error;
  }
}

/**
 * Award karma for being compared to (profile view)
 * Only once per day per viewer
 */
export async function awardKarmaForComparison(
  targetUserId: string,
  viewerUserId: string
): Promise<number> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if this viewer already gave karma today
    const existingLog = await prisma.actionLog.findFirst({
      where: {
        userId: targetUserId,
        action: 'karma_comparison',
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        metadata: {
          path: ['viewerId'],
          equals: viewerUserId,
        } as any,
      },
    });

    if (existingLog) {
      // Already awarded today by this viewer
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { karma: true },
      });
      return user?.karma || 0;
    }

    // Award karma
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        karma: { increment: 1 },
      },
      select: { karma: true },
    });

    // Log the action
    await prisma.actionLog.create({
      data: {
        userId: targetUserId,
        action: 'karma_comparison',
        metadata: {
          viewerId: viewerUserId,
          awardedAt: new Date().toISOString(),
        } as any,
      },
    });

    logger.info(
      `[KarmaService] Awarded +1 karma for comparison to user ${targetUserId} from viewer ${viewerUserId}`
    );
    return user.karma;
  } catch (error) {
    logger.error('[KarmaService] Failed to award karma for comparison', {
      targetUserId,
      viewerUserId,
      error,
    });
    throw error;
  }
}

/**
 * Deduct karma for reports (admin action)
 */
export async function deductKarmaForReport(userId: string, amount: number = 5): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        karma: { decrement: amount },
      },
      select: { karma: true },
    });

    logger.info(`[KarmaService] Deducted ${amount} karma for report from user ${userId}`);
    return user.karma;
  } catch (error) {
    logger.error('[KarmaService] Failed to deduct karma for report', { userId, amount, error });
    throw error;
  }
}

/**
 * Deduct karma for toxic interactions (future moderation)
 */
export async function deductKarmaForToxicInteraction(
  userId: string,
  amount: number = 3
): Promise<number> {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        karma: { decrement: amount },
      },
      select: { karma: true },
    });

    logger.info(`[KarmaService] Deducted ${amount} karma for toxic interaction from user ${userId}`);
    return user.karma;
  } catch (error) {
    logger.error('[KarmaService] Failed to deduct karma for toxic interaction', {
      userId,
      amount,
      error,
    });
    throw error;
  }
}

/**
 * Get user's current karma
 */
export async function getUserKarma(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { karma: true },
  });

  return user?.karma || 0;
}

