import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/meta/season
 * Returns current season info + user progress
 * v0.29.9 - Meta-Progression Layer
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
      seasonLevel: true,
      seasonXP: true,
      prestigeCount: true,
      legacyPerk: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get current active season
  const currentSeason = await prisma.metaSeason.findFirst({
    where: { isActive: true },
    orderBy: { startDate: 'desc' },
  });

  return successResponse({
    season: currentSeason
      ? {
          id: currentSeason.id,
          key: currentSeason.key,
          title: currentSeason.title,
          description: currentSeason.description,
          startDate: currentSeason.startDate,
          endDate: currentSeason.endDate,
          isActive: currentSeason.isActive,
        }
      : null,
    userProgress: {
      seasonLevel: user.seasonLevel,
      seasonXP: user.seasonXP,
      prestigeCount: user.prestigeCount,
      legacyPerk: user.legacyPerk,
    },
  });
});

