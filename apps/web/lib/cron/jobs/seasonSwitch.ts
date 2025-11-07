/**
 * Season Switch Job Handler (v0.29.21)
 * 
 * Handle season rollover and grants
 */

import { prisma } from '@/lib/db';

const SEASON_DURATION_DAYS = 30; // ~30 days per season

export async function runSeasonSwitch(): Promise<void> {
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
    const seasonNumber = await prisma.metaSeason.count();

    await prisma.metaSeason.create({
      data: {
        key: `season-${seasonNumber}`,
        title: `Season ${seasonNumber}`,
        description: `Season ${seasonNumber} of the meta-progression journey`,
        startDate: now,
        endDate: new Date(now.getTime() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });
  }
}

