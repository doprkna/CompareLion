import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const seasonId = searchParams.get('seasonId') || undefined;

  // Get all active clans with stats
  const clans = await prisma.microClan.findMany({
    where: {
      isActive: true,
      ...(seasonId ? { seasonId } : {}),
    },
    include: {
      stats: true,
      leader: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      stats: {
        rank: 'asc',
      },
    },
    take: 100,
  });

  // Format response
  const formatted = clans.map((clan) => ({
    id: clan.id,
    name: clan.name,
    description: clan.description,
    leader: clan.leader,
    memberCount: clan.memberIds.length + 1, // +1 for leader
    buffType: clan.buffType,
    buffValue: clan.buffValue,
    seasonId: clan.seasonId,
    stats: clan.stats
      ? {
          xpTotal: clan.stats.xpTotal,
          activityScore: clan.stats.activityScore,
          rank: clan.stats.rank,
          updatedAt: clan.stats.updatedAt,
        }
      : null,
    createdAt: clan.createdAt,
  }));

  return NextResponse.json({
    success: true,
    clans: formatted,
  });
});

