import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

const THRESHOLD_TOP = 3; // Top 3 factions get buffs

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') return unauthorizedError('Admin only');

  // Get top factions by global influence
  const topFactions = await prisma.factionInfluence.findMany({
    where: { region: 'GLOBAL' },
    orderBy: { influenceScore: 'desc' },
    take: THRESHOLD_TOP,
    include: { faction: true },
  });

  const topFactionIds = topFactions.map((inf) => inf.factionId);

  // Apply buffs to members of top factions
  const buffed = await prisma.userFaction.updateMany({
    where: {
      factionId: { in: topFactionIds },
    },
    data: {
      // Buffs are calculated dynamically in the application logic
      // This endpoint just logs that buffs should be active
    },
  });

  return NextResponse.json({
    success: true,
    topFactions: topFactions.map((inf) => ({
      factionId: inf.factionId,
      name: inf.faction.name,
      influence: inf.influenceScore,
      buffType: inf.faction.buffType,
      buffValue: inf.faction.buffValue,
    })),
    buffedMembers: buffed.count,
  });
});

