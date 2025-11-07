import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/wildcards/recent
 * Returns latest 3 user wildcard events
 * Auth required
 * v0.29.13 - Wildcard Events
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get recent wildcard events
  const recentWildcards = await prisma.userWildcardEvent.findMany({
    where: { userId: user.id },
    include: {
      wildcard: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  return successResponse({
    wildcards: recentWildcards.map((uw) => ({
      id: uw.id,
      wildcardId: uw.wildcard.id,
      title: uw.wildcard.title,
      description: uw.wildcard.description,
      flavorText: uw.wildcard.flavorText,
      rewardXP: uw.wildcard.rewardXP,
      rewardKarma: uw.wildcard.rewardKarma,
      redeemed: uw.redeemed,
      createdAt: uw.createdAt,
      redeemedAt: uw.redeemedAt,
    })),
    total: recentWildcards.length,
  });
});

