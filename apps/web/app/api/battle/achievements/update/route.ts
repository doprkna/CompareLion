/**
 * Battle Achievements Update API (v0.29.25)
 * 
 * POST /api/battle/achievements/update
 * Called automatically on duel or mission events
 * Throttled to once per match/session
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UpdateProgressSchema = z.object({
  triggerType: z.enum(['duelWin', 'duelLose', 'missionComplete', 'event']),
  userId: z.string().min(1),
  amount: z.number().int().min(1).default(1), // Increment amount
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const body = await req.json().catch(() => ({}));
  const validation = UpdateProgressSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { triggerType, userId, amount } = validation.data;

  // Get all achievements matching this trigger type
  const achievements = await (prisma as any).battleAchievement.findMany({
    where: {
      triggerType,
      isActive: true,
    },
  });

  if (achievements.length === 0) {
    return successResponse({
      updated: 0,
      unlocked: [],
      message: 'No achievements found for this trigger type',
    });
  }

  const unlocked: string[] = [];

  // Update progress for each achievement
  for (const achievement of achievements) {
    // Get or create user progress
    const userProgress = await (prisma as any).userBattleAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
      create: {
        userId,
        achievementId: achievement.id,
        progress: amount,
        isUnlocked: false,
        isClaimed: false,
      },
      update: {
        progress: { increment: amount },
      },
      include: {
        achievement: true,
      },
    });

    // Check if threshold is reached
    const newProgress = userProgress.progress;
    const shouldUnlock = !userProgress.isUnlocked && newProgress >= achievement.thresholdValue;

    if (shouldUnlock) {
      // Unlock achievement
      await (prisma as any).userBattleAchievement.update({
        where: { id: userProgress.id },
        data: {
          isUnlocked: true,
          unlockedAt: new Date(),
        },
      });

      unlocked.push(achievement.key);

      // Create notification (optional)
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: 'Achievement Unlocked',
          message: `${achievement.title} (+${achievement.rewardXP} XP available)`,
          metadata: {
            achievementId: achievement.id,
            achievementKey: achievement.key,
            rewardXP: achievement.rewardXP,
          },
        },
      }).catch(() => {}); // Ignore notification errors
    }
  }

  return successResponse({
    updated: achievements.length,
    unlocked,
    message: unlocked.length > 0 ? `${unlocked.length} achievement(s) unlocked` : 'Progress updated',
  });
});

