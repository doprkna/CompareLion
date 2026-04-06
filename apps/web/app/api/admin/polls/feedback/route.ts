/**
 * GET /api/admin/polls/feedback - Alpha feedback pack results (admin only)
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { ALPHA_FEEDBACK_PACK_KEY } from '@parel/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string })?.role;
  if (!session?.user?.email || !['ADMIN', 'MODERATOR'].includes(role ?? '')) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  const polls = await prisma.publicPoll.findMany({
    where: { packKey: ALPHA_FEEDBACK_PACK_KEY },
    orderBy: { createdAt: 'asc' },
    include: {
      responses: {
        select: { optionIdx: true, freetext: true, userId: true, createdAt: true },
      },
    },
  });

  const rewardsGranted = await prisma.user.count({ where: { feedbackRewardClaimed: true } });
  const starterCompleted = await prisma.user.count({ where: { starterFlowCompletedAt: { not: null } } });
  const pctCompleted = starterCompleted > 0 ? Math.round((rewardsGranted / starterCompleted) * 100) : 0;

  const byPoll = polls.map((p) => {
    const dist: Record<string, number> = {};
    const freetexts: { userId: string; text: string; createdAt: string }[] = [];
    for (const r of p.responses) {
      if (r.optionIdx != null && (p.options as string[])?.[r.optionIdx]) {
        const label = (p.options as string[])[r.optionIdx];
        dist[label] = (dist[label] ?? 0) + 1;
      }
      if (r.freetext && r.freetext.trim()) {
        freetexts.push({
          userId: r.userId,
          text: r.freetext,
          createdAt: r.createdAt.toISOString(),
        });
      }
    }
    return {
      id: p.id,
      question: p.question,
      options: (p.options as string[]) ?? [],
      distribution: dist,
      totalResponses: p.responses.length,
      freetexts,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      rewardsGranted,
      starterCompleted,
      pctCompleted,
      totalResponses: byPoll.reduce((s, b) => s + b.totalResponses, 0),
      polls: byPoll,
    },
  });
}
