/**
 * GET /api/roadmap
 * Public – return ordered roadmap items (order ASC, votesCount DESC secondary).
 * When authenticated, includes votedIds so UI can show "Voted" state.
 * v0.45.1 - Roadmap MVP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const top = req.nextUrl.searchParams.get('top');
    const limit = top ? Math.min(parseInt(top, 10) || 10, 20) : undefined;

    const [items, session] = await Promise.all([
      prisma.roadmapItem.findMany({
        orderBy: limit
          ? [{ votesCount: 'desc' as const }, { order: 'asc' as const }]
          : [{ order: 'asc' as const }, { votesCount: 'desc' as const }],
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          shortDescription: true,
          longDescription: true,
          pillar: true,
          status: true,
          order: true,
          votesCount: true,
          createdAt: true,
        },
      }),
      getServerSession(authOptions),
    ]);

    let votedIds: string[] = [];
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) {
        const votes = await prisma.roadmapVote.findMany({
          where: { userId: user.id },
          select: { roadmapItemId: true },
        });
        votedIds = votes.map((v) => v.roadmapItemId);
      }
    }

    return NextResponse.json({ ok: true, items, votedIds });
  } catch (err) {
    console.error('[GET /api/roadmap]', err);
    return NextResponse.json({ ok: false, error: 'Failed to load roadmap' }, { status: 500 });
  }
}
