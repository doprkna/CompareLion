import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  // Get all active clans
  const clans = await prisma.microClan.findMany({
    where: { isActive: true },
    include: {
      stats: true,
      leader: true,
    },
  });

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  let updated = 0;
  let ranked = 0;

  for (const clan of clans) {
    // Check if clan should be disbanded (inactive >14 days)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    if (clan.createdAt < fourteenDaysAgo) {
      // Check last activity (simplified check)
      const lastActivity = clan.stats?.updatedAt || clan.createdAt;
      if (lastActivity < fourteenDaysAgo) {
        await prisma.microClan.update({
          where: { id: clan.id },
          data: { isActive: false },
        });
        continue;
      }
    }

    // Compute activity score (sum of member XP earned in last 7 days)
    // For MVP, we'll use a simplified calculation
    const memberIds = [clan.leaderId, ...clan.memberIds];
    const memberStats = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, xp: true },
    });

    // Calculate clan XP (sum of member XP)
    const xpTotal = memberStats.reduce((sum, member) => sum + member.xp, 0);

    // Calculate activity score (simplified: based on member count and recent activity)
    // In a full implementation, this would check actions in the last 3-7 days
    const activityScore = memberStats.length * 100; // Base score per member

    // Update stats
    if (clan.stats) {
      await prisma.microClanStats.update({
        where: { clanId: clan.id },
        data: {
          xpTotal,
          activityScore,
        },
      });
      updated++;
    } else {
      await prisma.microClanStats.create({
        data: {
          clanId: clan.id,
          xpTotal,
          activityScore,
        },
      });
      updated++;
    }
  }

  // Recompute ranks based on xpTotal
  const allStats = await prisma.microClanStats.findMany({
    orderBy: { xpTotal: 'desc' },
  });

  for (let i = 0; i < allStats.length; i++) {
    await prisma.microClanStats.update({
      where: { id: allStats[i].id },
      data: { rank: i + 1 },
    });
    ranked++;
  }

  return NextResponse.json({
    success: true,
    updated,
    ranked,
    totalClans: clans.length,
  });
});

