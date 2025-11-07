/**
 * Creator Publish API (v0.29.27)
 * 
 * POST /api/creator/publish
 * Publishes approved pack + grants reward
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const PublishSchema = z.object({
  packId: z.string().min(1),
  rewardType: z.enum(['xp', 'gold', 'diamonds', 'badge']).optional(),
  rewardValue: z.number().int().min(0).optional(),
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
  const validation = PublishSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { packId, rewardType, rewardValue } = validation.data;

  // Get pack
  const pack = await prisma.creatorPack.findUnique({
    where: { id: packId },
    select: {
      id: true,
      creatorId: true,
      title: true,
      status: true,
      rewardType: true,
      rewardValue: true,
      publishedAt: true,
    },
  });

  if (!pack) {
    return notFoundError('Pack not found');
  }

  // Verify ownership
  if (pack.creatorId !== user.id) {
    return validationError('Not authorized to publish this pack');
  }

  // Verify pack is approved
  if (pack.status !== 'APPROVED') {
    return validationError('Pack must be approved before publishing');
  }

  // Check if already published
  if (pack.publishedAt) {
    return validationError('Pack is already published');
  }

  // Publish pack and grant reward
  await prisma.$transaction(async (tx) => {
    // Update pack with publish fields
    const finalRewardType = rewardType || pack.rewardType || 'xp';
    const finalRewardValue = rewardValue || pack.rewardValue || 500; // Default 500 XP

    await tx.creatorPack.update({
      where: { id: packId },
      data: {
        rewardType: finalRewardType,
        rewardValue: finalRewardValue,
        publishedAt: new Date(),
      },
    });

    // Grant initial publish reward
    if (finalRewardType === 'xp') {
      await tx.user.update({
        where: { id: user.id },
        data: { xp: { increment: finalRewardValue } },
      });
    } else if (finalRewardType === 'gold') {
      await tx.user.update({
        where: { id: user.id },
        data: { funds: { increment: finalRewardValue } },
      });
    } else if (finalRewardType === 'diamonds') {
      await tx.user.update({
        where: { id: user.id },
        data: { diamonds: { increment: finalRewardValue } },
      });
    }

    // Create or update UserCreatedPack
    await (tx as any).userCreatedPack.upsert({
      where: {
        userId_packId: {
          userId: user.id,
          packId: pack.id,
        },
      },
      create: {
        userId: user.id,
        packId: pack.id,
        isPublished: true,
        earnedRewards: finalRewardValue,
      },
      update: {
        isPublished: true,
        earnedRewards: { increment: finalRewardValue },
      },
    });
  });

  return successResponse({
    success: true,
    pack: {
      id: pack.id,
      title: pack.title,
      publishedAt: new Date().toISOString(),
      rewardType: rewardType || pack.rewardType || 'xp',
      rewardValue: rewardValue || pack.rewardValue || 500,
    },
    message: `Pack published successfully! (+${rewardValue || pack.rewardValue || 500} ${rewardType || pack.rewardType || 'XP'})`,
  });
});

