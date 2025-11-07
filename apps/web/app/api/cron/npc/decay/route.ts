/**
 * NPC Affinity Decay Cron (v0.29.29)
 * 
 * POST /api/cron/npc/decay
 * Reduces affinity slowly over inactivity
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days

  // Decay affinity for inactive relationships (no interaction in 7+ days)
  // Decay: -0.5 per day after 7 days, min 0
  const inactiveAffinities = await (prisma as any).npcAffinity.findMany({
    where: {
      lastInteraction: { lt: sevenDaysAgo },
      affinityScore: { gt: 0 },
    },
    select: {
      id: true,
      userId: true,
      npcId: true,
      affinityScore: true,
      lastInteraction: true,
    },
    take: 1000, // Limit for performance
  });

  let decayed = 0;
  let totalDecay = 0;

  for (const affinity of inactiveAffinities) {
    const daysSinceInteraction = Math.floor(
      (now.getTime() - affinity.lastInteraction.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Decay rate: -0.5 per day after 7 days
    const daysToDecay = Math.max(0, daysSinceInteraction - 7);
    const decayAmount = daysToDecay * 0.5;
    const newScore = Math.max(0, affinity.affinityScore - decayAmount);

    if (newScore < affinity.affinityScore) {
      await (prisma as any).npcAffinity.update({
        where: { id: affinity.id },
        data: { affinityScore: newScore },
      });
      decayed++;
      totalDecay += affinity.affinityScore - newScore;
    }
  }

  // Remove old affinities (inactive for 30+ days with 0 affinity)
  const removed = await (prisma as any).npcAffinity.deleteMany({
    where: {
      lastInteraction: { lt: thirtyDaysAgo },
      affinityScore: { lte: 0 },
    },
  });

  return successResponse({
    success: true,
    decayed: {
      count: decayed,
      totalDecay: Math.round(totalDecay * 100) / 100,
    },
    removed: removed.count,
    active: inactiveAffinities.length,
    message: `Decayed ${decayed} affinities (${Math.round(totalDecay * 100) / 100} total), removed ${removed.count} old entries`,
  });
});

