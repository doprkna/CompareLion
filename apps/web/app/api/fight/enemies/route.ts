/**
 * GET /api/fight/enemies
 * Get 3 random enemies for selection
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

  // Get 3 random enemies
  const allEnemies = await prisma.enemy.findMany({
    select: {
      id: true,
      name: true,
      hp: true,
      str: true,
      def: true,
      speed: true,
      rarity: true,
      xpReward: true,
      goldReward: true,
      sprite: true,
    },
  });

  // Shuffle and take 3
  const shuffled = allEnemies.sort(() => Math.random() - 0.5);
  const enemies = shuffled.slice(0, 3);

  return NextResponse.json({
    success: true,
    enemies,
  });
});

