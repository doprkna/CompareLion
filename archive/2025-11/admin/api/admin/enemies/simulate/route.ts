/**
 * POST /api/admin/enemies/simulate
 * Simulate 1000 fights for balance testing
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { simulateFight } from '@/lib/services/combatEngine';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, id: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  const body = await parseBody<{
    enemyId: string;
    userId?: string;
    count?: number;
  }>(req);

  if (!body.enemyId) {
    return validationError('Missing required field: enemyId');
  }

  const testUserId = body.userId || user.id;
  const count = body.count || 1000;

  // Simulate multiple fights
  const results = {
    wins: 0,
    losses: 0,
    totalRounds: 0,
    avgRounds: 0,
    totalXp: 0,
    totalGold: 0,
    itemsDropped: 0,
  };

  for (let i = 0; i < count; i++) {
    const fightResult = await simulateFight(testUserId, body.enemyId);
    
    if (fightResult.result === 'win') {
      results.wins++;
      results.totalXp += fightResult.xpReward;
      results.totalGold += fightResult.goldReward;
      results.itemsDropped += fightResult.items.length;
    } else {
      results.losses++;
    }
    
    results.totalRounds += fightResult.rounds;
  }

  results.avgRounds = results.totalRounds / count;

  return successResponse({
    simulations: count,
    results,
    winRate: (results.wins / count) * 100,
    avgXpPerWin: results.wins > 0 ? results.totalXp / results.wins : 0,
    avgGoldPerWin: results.wins > 0 ? results.totalGold / results.wins : 0,
  });
});

