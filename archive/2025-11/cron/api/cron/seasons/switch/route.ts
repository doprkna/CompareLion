import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

const SEASON_DURATION_DAYS = 30; // ~30 days per season

/**
 * POST /api/cron/seasons/switch
 * Closes old season, starts new one, grants global rewards
 * Admin/cron only - no manual user trigger
 * v0.29.9 - Meta-Progression Layer
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();

  // Find active season
  const activeSeason = await prisma.metaSeason.findFirst({
    where: { isActive: true },
    orderBy: { startDate: 'desc' },
  });

  if (activeSeason) {
    // Check if season should end (endDate passed or ~30 days elapsed)
    const shouldEnd =
      (activeSeason.endDate && activeSeason.endDate <= now) ||
      (!activeSeason.endDate &&
        activeSeason.startDate <= new Date(now.getTime() - SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000));

    if (shouldEnd) {
      // Close old season
      await prisma.metaSeason.update({
        where: { id: activeSeason.id },
        data: {
          isActive: false,
          endDate: activeSeason.endDate || now,
        },
      });

      // Grant global rewards (placeholder - implement rewards logic)
      // Future: grant badges, titles, or currency to top performers

      // Reset all users' season progress (XP/Level reset for new season)
      // Keep prestigeCount and legacyPerk intact
      await prisma.user.updateMany({
        data: {
          seasonLevel: 1,
          seasonXP: 0,
        },
      });
    }
  }

  // Check if new season should start (no active season exists)
  const hasActiveSeason = await prisma.metaSeason.findFirst({
    where: { isActive: true },
  });

  if (!hasActiveSeason) {
    // Create new season
    const seasonNumber =
      (await prisma.metaSeason.count()) + 1; // Simple numbering based on count

    const newSeason = await prisma.metaSeason.create({
      data: {
        key: `season-${seasonNumber}`,
        title: `Season ${seasonNumber}`,
        description: `Season ${seasonNumber} of the meta-progression journey`,
        startDate: now,
        endDate: new Date(now.getTime() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    return successResponse({
      success: true,
      message: '🌅 Season reset complete — new season started',
      closed: activeSeason ? 1 : 0,
      newSeason: {
        id: newSeason.id,
        key: newSeason.key,
        title: newSeason.title,
        startDate: newSeason.startDate,
        endDate: newSeason.endDate,
      },
    });
  }

  return successResponse({
    success: true,
    message: 'Season status checked — no changes needed',
    activeSeason: activeSeason
      ? {
          id: activeSeason.id,
          key: activeSeason.key,
          title: activeSeason.title,
          endDate: activeSeason.endDate,
        }
      : null,
  });
});

