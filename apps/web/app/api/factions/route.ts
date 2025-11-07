import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const regionParam = req.nextUrl.searchParams.get('region') || 'GLOBAL';
  
  const factions = await prisma.faction.findMany({
    where: { isActive: true },
    include: {
      influences: {
        where: { region: regionParam },
        orderBy: { influenceScore: 'desc' },
        take: 1,
      },
      _count: {
        select: { members: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const userId = session?.user?.email 
    ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
    : null;

  const userFaction = userId 
    ? await prisma.userFaction.findUnique({ where: { userId }, include: { faction: true } })
    : null;

  return NextResponse.json({
    success: true,
    factions: factions.map((f) => ({
      id: f.id,
      key: f.key,
      name: f.name,
      motto: f.motto,
      description: f.description,
      colorPrimary: f.colorPrimary,
      colorSecondary: f.colorSecondary,
      buffType: f.buffType,
      buffValue: f.buffValue,
      regionScope: f.regionScope,
      influence: f.influences[0]?.influenceScore || 0,
      membersCount: f._count.members,
    })),
    userFaction: userFaction ? {
      factionId: userFaction.factionId,
      joinedAt: userFaction.joinedAt,
      contributedXP: userFaction.contributedXP,
      isLeader: userFaction.isLeader,
      faction: {
        name: userFaction.faction.name,
        colorPrimary: userFaction.faction.colorPrimary,
      },
    } : null,
  });
});

