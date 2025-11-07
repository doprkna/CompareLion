import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

// GET /api/tags - return all tags grouped by type
export const GET = safeAsync(async (_req: NextRequest) => {
  const tags = await prisma.questionTag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, type: true, description: true },
  });

  const grouped = tags.reduce<Record<'tone' | 'content', any[]>>(
    (acc, t) => {
      const key = (t.type as 'tone' | 'content') || 'tone';
      acc[key].push(t);
      return acc;
    },
    { tone: [], content: [] }
  );

  const res = NextResponse.json({ success: true, tags: grouped, count: tags.length, timestamp: new Date().toISOString() });
  res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=1200');
  return res;
});


