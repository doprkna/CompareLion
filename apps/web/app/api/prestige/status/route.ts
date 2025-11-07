import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getPrestigeTitle, getPrestigeColorTheme } from '@/lib/services/prestigeService';

const PRESTIGE_LEVEL_CAP = 50;

/**
 * GET /api/prestige/status
 * Returns current prestige level and rewards
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
      seasonLevel: true,
      seasonXP: true,
      prestigeCount: true,
      prestigeTitle: true,
      prestigeBadgeId: true,
      prestigeColorTheme: true,
      equippedTitle: true,
      xp: true,
      level: true,
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

  // Calculate progress to next prestige
  const canPrestige = user.seasonLevel >= PRESTIGE_LEVEL_CAP;
  const progressToNext = user.seasonLevel >= PRESTIGE_LEVEL_CAP ? 100 : (user.seasonLevel / PRESTIGE_LEVEL_CAP) * 100;

  // Get title and color theme for current prestige level
  const currentTitle = user.prestigeTitle || getPrestigeTitle(user.prestigeCount) || null;
  const currentColorTheme = user.prestigeColorTheme || getPrestigeColorTheme(user.prestigeCount) || null;

  // Get badge info if exists
  let badgeInfo = null;
  if (user.prestigeBadgeId) {
    const badge = await prisma.badge.findUnique({
      where: { id: user.prestigeBadgeId },
      select: {
        id: true,
        key: true,
        name: true,
        icon: true,
        rarity: true,
      },
    });
    if (badge) {
      badgeInfo = badge;
    }
  }

  return successResponse({
    prestigeCount: user.prestigeCount,
    seasonLevel: user.seasonLevel,
    seasonXP: user.seasonXP,
    canPrestige,
    progressToNext,
    prestigeTitle: currentTitle,
    prestigeBadge: badgeInfo,
    prestigeColorTheme: currentColorTheme,
    equippedTitle: user.equippedTitle,
    season: currentSeason ? {
      id: currentSeason.id,
      title: currentSeason.title,
      key: currentSeason.key,
    } : null,
  });
});

