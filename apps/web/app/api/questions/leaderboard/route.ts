/**
 * GET /api/questions/leaderboard
 * mode=top|trending, window=48h|7d|all, geo=global|country, country=CZ
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/api-handler';

const WINDOW_MS = { '48h': 48 * 60 * 60 * 1000, '7d': 7 * 24 * 60 * 60 * 1000 } as const;

export async function GET(req: NextRequest) {
  const user = await getFlowUser(req);
  const sp = req.nextUrl.searchParams;
  const mode = (sp.get('mode') ?? 'trending') as 'top' | 'trending';
  const windowParam = sp.get('window') ?? (mode === 'trending' ? '48h' : 'all');
  const window = mode === 'top' ? 'all' : (windowParam === '7d' ? '7d' : '48h');
  const geo = (sp.get('geo') ?? 'global') as 'global' | 'country';
  const countryParam = sp.get('country') ?? null;
  const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '20', 10)));
  const cursor = sp.get('cursor') ?? null;

  let country: string | null = null;
  if (geo === 'country') {
    country = countryParam ?? (user ? await getUserCountry(user.id) : null) ?? null;
  }

  const windowStart =
    window === 'all' ? null : new Date(Date.now() - WINDOW_MS[window]);

  const { items, nextCursor } = await fetchLeaderboardItems({
    windowStart,
    country,
    limit,
    cursor,
  });

  return successResponse({
    items,
    nextCursor,
    applied: { mode, window, geo, country },
  });
}

async function getUserCountry(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { countryCode: true },
  });
  return u?.countryCode ?? null;
}

async function fetchLeaderboardItems(opts: {
  windowStart: Date | null;
  country: string | null;
  limit: number;
  cursor: string | null;
}) {
  const { windowStart, country, limit, cursor } = opts;

  const baseWhere: { createdAt?: { gte: Date }; userId?: { in: string[] } } = {};
  if (windowStart) baseWhere.createdAt = { gte: windowStart };

  let userIds: string[] | null = null;
  if (country && country.length > 0) {
    const users = await prisma.user.findMany({
      where: { countryCode: country },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
    if (userIds.length === 0) {
      return { items: [], nextCursor: null };
    }
    baseWhere.userId = { in: userIds };
  }

  const grouped = await prisma.questionReaction.groupBy({
    by: ['questionId', 'type'],
    where: baseWhere,
    _count: { id: true },
  });

  const scores = new Map<string, { likeCount: number; dislikeCount: number; score: number }>();
  for (const r of grouped) {
    let s = scores.get(r.questionId);
    if (!s) {
      s = { likeCount: 0, dislikeCount: 0, score: 0 };
      scores.set(r.questionId, s);
    }
    const c = r._count.id;
    if (r.type === 'LIKE') {
      s.likeCount = c;
      s.score += c;
    } else {
      s.dislikeCount = c;
      s.score -= c;
    }
  }

  const sorted = [...scores.entries()]
    .map(([questionId, s]) => ({ questionId, ...s }))
    .filter((s) => s.score > 0 || s.likeCount > 0 || s.dislikeCount > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.likeCount - a.likeCount;
    });

  const fromIdx = cursor ? sorted.findIndex((s) => s.questionId === cursor) + 1 : 0;
  const slice = sorted.slice(fromIdx, fromIdx + limit + 1);
  const hasMore = slice.length > limit;
  const page = hasMore ? slice.slice(0, limit) : slice;
  const questionIds = page.map((s) => s.questionId);

  const questions = await prisma.flowQuestion.findMany({
    where: { id: { in: questionIds }, isActive: true },
    select: {
      id: true,
      text: true,
      categoryId: true,
      category: { select: { name: true } },
    },
  });

  const qMap = new Map(questions.map((q) => [q.id, q]));
  const items = page
    .map((s) => {
      const q = qMap.get(s.questionId);
      if (!q) return null;
      return {
        question: {
          id: q.id,
          text: q.text,
          categoryId: q.categoryId,
          categoryName: q.category?.name ?? null,
        },
        stats: {
          likeCount: s.likeCount,
          dislikeCount: s.dislikeCount,
          score: s.score,
          window: windowStart ? 'windowed' : 'all',
        },
      };
    })
    .filter(Boolean);

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1].questionId : null,
  };
}
