import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/prestige/history
 * Returns previous prestiges list
 * Auth required
 * v0.29.14 - Prestige System Expansion
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

  // Get all prestige records with season info
  const prestigeRecords = await prisma.prestigeRecord.findMany({
    where: { userId: user.id },
    include: {
      season: {
        select: {
          id: true,
          key: true,
          title: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Get badge IDs from prestige records
  const badgeIds = prestigeRecords
    .map((r) => r.prestigeBadgeId || r.rewardBadgeId)
    .filter((id): id is string => !!id);

  // Fetch badge details
  const badges = badgeIds.length > 0
    ? await prisma.badge.findMany({
        where: { id: { in: badgeIds } },
        select: {
          id: true,
          key: true,
          name: true,
          icon: true,
          rarity: true,
          description: true,
        },
      })
    : [];

  const badgeMap = new Map(badges.map((b) => [b.id, b]));

  return successResponse({
    prestigeRecords: prestigeRecords.map((record) => ({
      id: record.id,
      prestigeCount: record.prestigeCount,
      oldLevel: record.oldLevel,
      legacyXP: record.legacyXP,
      prestigeTitle: record.prestigeTitle,
      prestigeBadgeId: record.prestigeBadgeId || record.rewardBadgeId,
      prestigeBadge: record.prestigeBadgeId || record.rewardBadgeId ? badgeMap.get(record.prestigeBadgeId || record.rewardBadgeId || '') : null,
      prestigeColorTheme: record.prestigeColorTheme,
      season: {
        id: record.season.id,
        key: record.season.key,
        title: record.season.title,
        startDate: record.season.startDate,
        endDate: record.season.endDate,
      },
      createdAt: record.createdAt,
    })),
    total: prestigeRecords.length,
  });
});

