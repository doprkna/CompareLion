/**
 * Battle Achievements Claim API (v0.29.25)
 * 
 * POST /api/battle/achievements/claim
 * Grants XP or badge reward
 * Double-checks isClaimed flag to prevent double-claims
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const ClaimSchema = z.object({
  achievementId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, xp: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const validation = ClaimSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { achievementId } = validation.data;

  // Get user progress
  const userProgress = await (prisma as any).userBattleAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId: user.id,
        achievementId,
      },
    },
    include: {
      achievement: true,
    },
  });

  if (!userProgress) {
    return validationError('Achievement progress not found');
  }

  // Double-check: must be unlocked and not claimed
  if (!userProgress.isUnlocked) {
    return validationError('Achievement not unlocked yet');
  }

  if (userProgress.isClaimed) {
    return validationError('Reward already claimed');
  }

  // Claim rewards in transaction
  await prisma.$transaction(async (tx) => {
    // Mark as claimed
    await (tx as any).userBattleAchievement.update({
      where: { id: userProgress.id },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
      },
    });

    // Grant XP
    if (userProgress.achievement.rewardXP > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: userProgress.achievement.rewardXP },
        },
      });
    }

    // Grant badge if specified
    if (userProgress.achievement.rewardBadgeId) {
      const existingBadge = await tx.userBadge.findUnique({
        where: {
          userId_badgeId: {
            userId: user.id,
            badgeId: userProgress.achievement.rewardBadgeId,
          },
        },
      });

      if (!existingBadge) {
        await tx.userBadge.create({
          data: {
            userId: user.id,
            badgeId: userProgress.achievement.rewardBadgeId,
            unlockedAt: new Date(),
            isClaimed: false,
          },
        });
      }
    }

    // Create lore entry (optional)
    if (userProgress.achievement.rarity === 'legendary' || userProgress.achievement.rarity === 'epic') {
      await tx.userLoreEntry.create({
        data: {
          userId: user.id,
          sourceType: 'event',
          sourceId: achievementId,
          tone: 'serious',
          text: `Earned the ${userProgress.achievement.title} achievement.`,
        },
      }).catch(() => {}); // Ignore lore errors
    }
  });

  return successResponse({
    success: true,
    achievement: {
      id: userProgress.achievement.id,
      title: userProgress.achievement.title,
      rewardXP: userProgress.achievement.rewardXP,
      rewardBadgeId: userProgress.achievement.rewardBadgeId,
    },
    rewards: {
      xp: userProgress.achievement.rewardXP,
      badge: userProgress.achievement.rewardBadgeId ? 'granted' : null,
    },
    message: `Reward claimed: +${userProgress.achievement.rewardXP} XP${userProgress.achievement.rewardBadgeId ? ' + Badge' : ''}`,
  });
});

