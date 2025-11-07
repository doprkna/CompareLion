import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, notFoundError } from '@/lib/api-handler';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return safeAsync(async () => {
    const clan = await prisma.microClan.findUnique({
      where: { id: params.id },
      include: {
        stats: true,
        leader: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    });

    if (!clan || !clan.isActive) return notFoundError('Clan not found or inactive');

    // Get member details
    const memberIds = clan.memberIds;
    const members = await prisma.user.findMany({
      where: {
        id: { in: memberIds },
      },
      select: {
        id: true,
        name: true,
        image: true,
        email: true,
      },
    });

    // Check if buff is active (≥3 members participated in last 3 days)
    // For MVP, we'll use a simple check: if clan has ≥3 active members
    const allMembers = [clan.leader, ...members];
    const buffActive = allMembers.length >= 3;

    return NextResponse.json({
      success: true,
      clan: {
        id: clan.id,
        name: clan.name,
        description: clan.description,
        leader: clan.leader,
        members,
        memberCount: allMembers.length,
        buffType: clan.buffType,
        buffValue: clan.buffValue,
        buffActive,
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
      },
    });
  })();
}

