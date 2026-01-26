/**
 * Combat Fight API 2.0
 * POST /api/combat/fight
 * Deterministic turn-based combat system
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { simulateFight, grantFightRewards } from '@/lib/services/combatEngine';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/combat/fight
 * Body: { enemyId: string }
 * 
 * Flow:
 * 1. Load user stats (base + items + pet + buffs)
 * 2. Load enemy template
 * 3. Simulate turn-based fight (user always starts)
 * 4. Return fight result with rewards
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody<{
    enemyId: string;
  }>(req);

  if (!body.enemyId) {
    return validationError('Missing required field: enemyId');
  }

  // Verify enemy exists
  const enemy = await prisma.enemy.findUnique({
    where: { id: body.enemyId },
  });

  if (!enemy) {
    return validationError('Enemy not found');
  }

  try {
    // Simulate fight
    const fightResult = await simulateFight(user.id, body.enemyId);

    // Grant rewards if win
    await grantFightRewards(user.id, fightResult);

    logger.info('[CombatFight] Fight completed', {
      userId: user.id,
      enemyId: body.enemyId,
      result: fightResult.result,
      rounds: fightResult.rounds,
    });

    return successResponse({
      result: fightResult.result,
      rounds: fightResult.rounds,
      logs: fightResult.logs,
      xpReward: fightResult.xpReward,
      goldReward: fightResult.goldReward,
      items: fightResult.items,
      petXpGained: fightResult.petXpGained,
    });
  } catch (error: any) {
    logger.error('[CombatFight] Fight simulation failed', error);
    return validationError(error?.message || 'Failed to simulate fight');
  }
});

