/**
 * Creator Pack Use API (v0.29.27)
 * 
 * POST /api/creator/use
 * User engages with community pack (reflection, poll, mission)
 * Tracks usage and grants rewards per 10 uses
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const UsePackSchema = z.object({
  packId: z.string().min(1),
  usageType: z.enum(['reflection', 'poll', 'mission']).optional(),
});

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

  const body = await req.json().catch(() => ({}));
  const validation = UsePackSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { packId, usageType } = validation.data;

  // Get pack
  const pack = await prisma.creatorPack.findUnique({
    where: { id: packId },
    select: {
      id: true,
      creatorId: true,
      title: true,
      status: true,
      publishedAt: true,
      rewardType: true,
      rewardValue: true,
      downloadsCount: true,
    },
  });

  if (!pack) {
    return notFoundError('Pack not found');
  }

  // Verify pack is published
  if (!pack.publishedAt || pack.status !== 'APPROVED') {
    return validationError('Pack is not available for use');
  }

  // Verify user is not the creator (can't use own pack)
  if (pack.creatorId === user.id) {
    return validationError('Cannot use your own pack');
  }

  // Check daily reward cap (prevent farming abuse)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRewards = await (prisma as any).userCreatedPack.findFirst({
    where: {
      userId: pack.creatorId,
      packId: pack.id,
      updatedAt: { gte: today },
    },
    select: { earnedRewards: true },
  });

  // Daily cap: max 10 rewards per pack per day (100 uses)
  const dailyCap = 10;
  const rewardsToday = todayRewards ? Math.floor((todayRewards.earnedRewards || 0) / (pack.rewardValue || 500)) : 0;

  if (rewardsToday >= dailyCap) {
    return validationError('Daily reward cap reached for this pack');
  }

  // Update pack usage and grant rewards
  const result = await prisma.$transaction(async (tx) => {
    // Increment downloads count
    await tx.creatorPack.update({
      where: { id: packId },
      data: {
        downloadsCount: { increment: 1 },
      },
    });

    // Check if we've reached a milestone (every 10 uses)
    const newDownloadsCount = (pack.downloadsCount || 0) + 1;
    const milestone = Math.floor(newDownloadsCount / 10);
    const previousMilestone = Math.floor((pack.downloadsCount || 0) / 10);
    const reachedMilestone = milestone > previousMilestone;

    // Grant reward to creator if milestone reached
    if (reachedMilestone && pack.rewardType && pack.rewardValue) {
      const creator = await tx.user.findUnique({
        where: { id: pack.creatorId },
        select: { id: true, xp: true },
      });

      if (creator) {
        // Grant reward
        if (pack.rewardType === 'xp') {
          await tx.user.update({
            where: { id: pack.creatorId },
            data: { xp: { increment: pack.rewardValue } },
          });
        } else if (pack.rewardType === 'gold') {
          await tx.user.update({
            where: { id: pack.creatorId },
            data: { funds: { increment: pack.rewardValue } },
          });
        } else if (pack.rewardType === 'diamonds') {
          await tx.user.update({
            where: { id: pack.creatorId },
            data: { diamonds: { increment: pack.rewardValue } },
          });
        }

        // Update UserCreatedPack
        await (tx as any).userCreatedPack.upsert({
          where: {
            userId_packId: {
              userId: pack.creatorId,
              packId: pack.id,
            },
          },
          create: {
            userId: pack.creatorId,
            packId: pack.id,
            isPublished: true,
            earnedRewards: pack.rewardValue,
          },
          update: {
            earnedRewards: { increment: pack.rewardValue },
          },
        });
      }
    }

    return {
      downloadsCount: newDownloadsCount,
      reachedMilestone,
      milestone,
    };
  });

  return successResponse({
    success: true,
    pack: {
      id: pack.id,
      title: pack.title,
      downloadsCount: result.downloadsCount,
    },
    milestone: result.reachedMilestone ? {
      number: result.milestone,
      uses: result.downloadsCount,
    } : null,
    message: result.reachedMilestone
      ? `Pack reached ${result.downloadsCount} uses! Creator rewarded.`
      : 'Pack used successfully',
  });
});

