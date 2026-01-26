/**
 * Combat Logs API
 * GET /api/combat/logs - Get paginated combat logs for logged user
 * v0.36.27 - Combat Log 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getFightLogs, trimOldFights } from '@/lib/services/combatLogService';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
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

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const cursor = searchParams.get('cursor') || undefined;

  if (limit > 50) {
    return validationError('Limit cannot exceed 50');
  }

  await trimOldFights(user.id);
  const result = await getFightLogs(user.id, { limit, cursor });

  const enrichedFights = await Promise.all(
    result.fights.map(async (fight) => {
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
      return { ...fight, enemyName };
    })
  );

  return successResponse({
    fights: enrichedFights,
    nextCursor: result.nextCursor,
  });
});
