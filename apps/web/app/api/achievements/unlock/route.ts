import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { unlockAchievement } from '@/lib/services/achievementService';
import { safeAsync, unauthorizedError, successResponse, validationError, parseBody } from '@/lib/api-handler';

/**
 * POST /api/achievements/unlock
 * Unlocks an achievement for the current user
 * Body: { key: string, tier?: number }
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  const body = await parseBody<{ key: string; tier?: number }>(req);

  if (!body.key) {
    return validationError('Missing required field: key');
  }

  const result = await unlockAchievement(user.id, body.key, body.tier || 1);

  if (!result) {
    return validationError(`Achievement not found: ${body.key}`);
  }

  // Fetch the achievement for response data
  const achievement = await prisma.achievement.findUnique({
    where: { key: body.key },
    select: {
      id: true,
      key: true,
      title: true,
      name: true,
      description: true,
      emoji: true,
      icon: true,
      category: true,
      tier: true,
    },
  });

  return successResponse({
    unlocked: result.unlocked,
    alreadyUnlocked: result.alreadyUnlocked,
    achievement: achievement ? {
      ...achievement,
      xpReward: result.xpReward,
      goldReward: result.goldReward,
    } : null,
  });
});

