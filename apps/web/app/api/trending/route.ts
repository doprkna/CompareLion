import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

// GET /api/trending?region=global|CZ
export const GET = safeAsync(async (req: NextRequest) => {
  const url = new URL(req.url);
  const region = (url.searchParams.get('region') || 'global').toUpperCase();
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50);

  const items = await prisma.trendingQuestion.findMany({
    where: { region },
    orderBy: { score: 'desc' },
    take: limit,
    include: {
      question: {
        select: {
          id: true,
          text: true,
          createdAt: true,
          region: true,
          localeCode: true,
          reactionsLike: true,
          reactionsLaugh: true,
          reactionsThink: true,
        },
      },
    },
  });

  const mapped = items.map((it) => ({
    id: it.question.id,
    text: it.question.text,
    region: it.question.region || 'GLOBAL',
    localeCode: it.question.localeCode || 'global',
    createdAt: it.question.createdAt,
    reactionsTotal: (it.question.reactionsLike || 0) + (it.question.reactionsLaugh || 0) + (it.question.reactionsThink || 0),
    score: it.score,
  }));

  const res = NextResponse.json({ success: true, region, items: mapped, timestamp: new Date().toISOString() });
  res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  return res;
});


