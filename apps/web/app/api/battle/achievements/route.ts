/**
 * Battle Achievements API (v0.29.25)
 * 
 * GET /api/battle/achievements
 * Returns list of achievements with user progress
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get all active achievements
  const achievements = await (prisma as any).battleAchievement.findMany({
    where: { isActive: true },
    orderBy: [
      { rarity: 'asc' }, // common, rare, epic, legendary
      { thresholdValue: 'asc' },
    ],
  });

  // Get user progress for all achievements
  const userProgress = await (prisma as any).userBattleAchievement.findMany({
    where: { userId: user.id },
    select: {
      achievementId: true,
      progress: true,
      isUnlocked: true,
      isClaimed: true,
      unlockedAt: true,
      claimedAt: true,
    },
  });

  // Create progress map
  const progressMap = new Map(
    userProgress.map(p => [p.achievementId, p])
  );

  // Merge achievements with progress
  const achievementsWithProgress = achievements.map((achievement: any) => {
    const progress = progressMap.get(achievement.id) || {
      progress: 0,
      isUnlocked: false,
      isClaimed: false,
      unlockedAt: null,
      claimedAt: null,
    };

    return {
      id: achievement.id,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      triggerType: achievement.triggerType,
      thresholdValue: achievement.thresholdValue,
      rewardXP: achievement.rewardXP,
      rewardBadgeId: achievement.rewardBadgeId,
      rarity: achievement.rarity,
      progress: progress.progress,
      isUnlocked: progress.isUnlocked,
      isClaimed: progress.isClaimed,
      unlockedAt: progress.unlockedAt,
      claimedAt: progress.claimedAt,
      progressPercent: Math.min(100, Math.round((progress.progress / achievement.thresholdValue) * 100)),
    };
  });

  return successResponse({
    achievements: achievementsWithProgress,
    count: achievementsWithProgress.length,
    unlocked: achievementsWithProgress.filter((a: any) => a.isUnlocked).length,
    claimed: achievementsWithProgress.filter((a: any) => a.isClaimed).length,
  });
});

