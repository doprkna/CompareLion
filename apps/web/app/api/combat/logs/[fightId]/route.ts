/**
 * Combat Log API - Single Fight
 * GET /api/combat/logs/[fightId] - Get full log for a single fight
 * v0.36.27 - Combat Log 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, notFoundError, successResponse } from '@/lib/api-handler';
import { getSingleFight } from '@/lib/services/combatLogService';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = safeAsync(
  async (
    req: NextRequest,
    { params }: { params: { fightId: string } }
  ) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedError('You must be logged in to view combat logs');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return unauthorizedError('User not found');
    }

    const { fightId } = params;

    if (!fightId) {
      return notFoundError('Fight ID required');
    }

    const fight = await getSingleFight(fightId, user.id);

    if (!fight) {
      return notFoundError('Fight not found');
    }

    let enemyName: string | undefined;
    if (fight.enemyId && !fight.enemyId.startsWith('generated-')) {
      try {
        const enemy = await prisma.enemy.findUnique({
          where: { id: fight.enemyId },
          select: { name: true },
        });
        enemyName = enemy?.name;
      } catch (error) {}
    } else if (fight.enemyId?.startsWith('generated-')) {
      enemyName = 'Generated Enemy';
    }

    return successResponse({
      ...fight,
      enemyName,
    });
  }
);
