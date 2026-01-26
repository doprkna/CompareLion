import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';

/**
 * GET /api/meta/legacy
 * Returns user legacy summary (past seasons, perks, prestige records)
 * v0.29.9 - Meta-Progression Layer
 * v0.41.3 - C3 Step 4: Unified API envelope
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      prestigeCount: true,
      legacyPerk: true,
    },
  });

  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'User not found');
  }

  // Get all prestige records with badge info
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
    .map((r) => r.rewardBadgeId)
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

  // Get all past seasons (where user has prestige records)
  const seasonIds = prestigeRecords.map((r) => r.seasonId);
  const pastSeasons = await prisma.metaSeason.findMany({
    where: {
      id: { in: seasonIds },
      isActive: false,
    },
    orderBy: { startDate: 'desc' },
  });

  // Calculate total legacy XP
  const totalLegacyXP = prestigeRecords.reduce((sum, record) => sum + record.legacyXP, 0);

  return buildSuccess(req, {
    prestigeCount: user.prestigeCount,
    legacyPerk: user.legacyPerk,
    totalLegacyXP,
    prestigeRecords: prestigeRecords.map((record) => ({
      id: record.id,
      season: {
        id: record.season.id,
        key: record.season.key,
        title: record.season.title,
      },
      oldLevel: record.oldLevel,
      legacyXP: record.legacyXP,
      prestigeCount: record.prestigeCount,
      rewardBadgeId: record.rewardBadgeId,
      badge: record.rewardBadgeId ? badgeMap.get(record.rewardBadgeId) || null : null,
      createdAt: record.createdAt,
    })),
    pastSeasons: pastSeasons.map((season) => ({
      id: season.id,
      key: season.key,
      title: season.title,
      startDate: season.startDate,
      endDate: season.endDate,
    })),
  });
});
