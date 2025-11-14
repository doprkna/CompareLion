/**
 * GET /api/fight/history
 * Get fight history for the current user
 * v0.36.0 - Full Fighting System MVP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, authError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return authError();
  }

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const fights = await prisma.fight.findMany({
    where: { heroId: user.id },
    include: {
      enemy: {
        select: {
          id: true,
          name: true,
          rarity: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });

  const total = await prisma.fight.count({
    where: { heroId: user.id },
  });

  return NextResponse.json({
    success: true,
    fights: fights.map(fight => ({
      id: fight.id,
      enemy: fight.enemy,
      winner: fight.winner,
      rounds: fight.rounds,
      createdAt: fight.createdAt,
    })),
    total,
    limit,
    offset,
  });
});

