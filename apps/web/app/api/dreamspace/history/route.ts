import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/dreamspace/history
 * Returns last 5 dreams for user
 * Auth required
 * v0.29.16 - Dreamspace
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

  // Get recent dream events
  const userDreams = await prisma.userDreamEvent.findMany({
    where: { userId: user.id },
    include: {
      dream: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return successResponse({
    dreams: userDreams.map((ud) => ({
      id: ud.id,
      dreamId: ud.dream.id,
      title: ud.dream.title,
      description: ud.dream.description,
      flavorTone: ud.dream.flavorTone,
      effect: ud.dream.effect,
      resolved: ud.resolved,
      createdAt: ud.createdAt,
      resolvedAt: ud.resolvedAt,
    })),
    total: userDreams.length,
  });
});

