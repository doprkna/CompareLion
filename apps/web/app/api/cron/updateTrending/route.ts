import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

// GET /api/cron/updateTrending - idempotent hourly job
export const GET = safeAsync(async (_req: NextRequest) => {
  const now = new Date();
  const windowEnd = now;
  const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Strategy: consider approved questions created within last 24h;
  // score = reactions24h (fallback: total reactions fields) with cutoff > 10
  const recent = await prisma.question.findMany({
    where: {
      approved: true,
      createdAt: { gte: windowStart },
    },
    select: {
      id: true,
      region: true,
      reactionsLike: true,
      reactionsLaugh: true,
      reactionsThink: true,
    },
  });

  let upserts = 0;
  for (const q of recent) {
    const reactions24h = (q.reactionsLike || 0) + (q.reactionsLaugh || 0) + (q.reactionsThink || 0);
    if (reactions24h <= 10) continue;
    const score = reactions24h; // simple until velocity added

    await prisma.trendingQuestion.upsert({
      where: { questionId_region: { questionId: q.id, region: (q.region || 'GLOBAL').toUpperCase() } as any },
      update: { reactions24h, score, windowStart, windowEnd },
      create: {
        questionId: q.id,
        region: (q.region || 'GLOBAL').toUpperCase(),
        reactions24h,
        score,
        windowStart,
        windowEnd,
      },
    });
    upserts++;
  }

  // Also maintain a GLOBAL scope leaderboard as a union
  const topGlobal = recent
    .map((q) => ({ id: q.id, reactions: (q.reactionsLike || 0) + (q.reactionsLaugh || 0) + (q.reactionsThink || 0) }))
    .filter((x) => x.reactions > 10)
    .sort((a, b) => b.reactions - a.reactions)
    .slice(0, 200);

  for (const g of topGlobal) {
    await prisma.trendingQuestion.upsert({
      where: { questionId_region: { questionId: g.id, region: 'GLOBAL' } as any },
      update: { reactions24h: g.reactions, score: g.reactions, windowStart, windowEnd },
      create: {
        questionId: g.id,
        region: 'GLOBAL',
        reactions24h: g.reactions,
        score: g.reactions,
        windowStart,
        windowEnd,
      },
    });
  }

  const res = NextResponse.json({ success: true, updated: upserts + topGlobal.length, windowStart, windowEnd, timestamp: now.toISOString() });
  res.headers.set('Cache-Control', 'no-store');
  return res;
});


