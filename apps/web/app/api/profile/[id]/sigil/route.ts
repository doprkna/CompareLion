import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/app/api/_utils';
import { authError, notFoundError, safeAsync } from '@/lib/api-handler';
import { generateSigil, type SigilStats } from '@parel/core';

export const GET = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser) {
    return authError('Unauthorized');
  }

  const userId = params.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      level: true,
      karma: true,
      streakCount: true,
      questionsAnswered: true,
    },
  });

  if (!user) {
    return notFoundError('User');
  }

  const level = Number(user.level ?? 1);
  const questions = Number(user.questionsAnswered ?? 0);
  const karma = Number(user.karma ?? 0);
  const streak = Number(user.streakCount ?? 0) || 0;

  const archetypeScore = Math.min(100, Math.max(0, level * 5));
  const bucketsRaw = [
    level * 10,
    Math.sqrt(Math.max(0, questions)) * 5,
    Math.log10(Math.max(1, karma + 1)) * 25,
  ];
  const percentileBuckets = bucketsRaw.map((v) =>
    Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0))
  );

  const stats: SigilStats = { archetypeScore, streak, percentileBuckets };
  const { svg } = generateSigil(user.id, stats);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'private, max-age=60',
    },
  });
});

