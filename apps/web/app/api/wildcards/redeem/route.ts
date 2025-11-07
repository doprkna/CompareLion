import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const RedeemWildcardSchema = z.object({
  userWildcardId: z.string().min(1),
});

/**
 * POST /api/wildcards/redeem
 * Grant reward + flavor message
 * Auth required
 * v0.29.13 - Wildcard Events
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      xp: true,
      karmaScore: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = RedeemWildcardSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { userWildcardId } = parsed.data;

  // Get user wildcard event
  const userWildcard = await prisma.userWildcardEvent.findUnique({
    where: { id: userWildcardId },
    include: {
      wildcard: true,
    },
  });

  if (!userWildcard) {
    return notFoundError('Wildcard event not found');
  }

  // Verify ownership
  if (userWildcard.userId !== user.id) {
    return validationError('Not authorized to redeem this wildcard');
  }

  // Check if already redeemed
  if (userWildcard.redeemed) {
    return validationError('Wildcard already redeemed');
  }

  // Grant rewards in transaction
  await prisma.$transaction(async (tx) => {
    // Update user wildcard as redeemed
    await tx.userWildcardEvent.update({
      where: { id: userWildcardId },
      data: {
        redeemed: true,
        redeemedAt: new Date(),
      },
    });

    // Grant XP
    if (userWildcard.wildcard.rewardXP > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: (user.xp || 0) + userWildcard.wildcard.rewardXP,
        },
      });
    }

    // Grant Karma
    if (userWildcard.wildcard.rewardKarma > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          karmaScore: (user.karmaScore || 0) + userWildcard.wildcard.rewardKarma,
        },
      });
    }
  });

  return successResponse({
    success: true,
    wildcard: {
      id: userWildcard.wildcard.id,
      title: userWildcard.wildcard.title,
      flavorText: userWildcard.wildcard.flavorText,
      rewardXP: userWildcard.wildcard.rewardXP,
      rewardKarma: userWildcard.wildcard.rewardKarma,
    },
    message: userWildcard.wildcard.flavorText,
  });
});

