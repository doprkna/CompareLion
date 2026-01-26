/**
 * GET /api/enemies/[id]
 * Get enemy by ID
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, notFoundError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const enemy = await prisma.enemy.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      level: true,
      power: true,
      defense: true,
      maxHp: true,
      rarity: true,
      icon: true,
    },
  });

  if (!enemy) {
    return notFoundError('Enemy');
  }

  return successResponse(enemy);
});

