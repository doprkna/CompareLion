import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const { id } = ctx.params;
  const poll = await prisma.publicPoll.findUnique({ where: { id } });
  if (!poll) return notFoundError('Poll not found');

  const total = await prisma.pollResponse.count({ where: { pollId: id } });
  const optionCounts: number[] = [];
  for (let i = 0; i < (poll.options?.length || 0); i++) {
    const c = await prisma.pollResponse.count({ where: { pollId: id, optionIdx: i } });
    optionCounts.push(c);
  }
  const freetextCount = await prisma.pollResponse.count({ where: { pollId: id, freetext: { not: null } } });

  return NextResponse.json({ success: true, poll, stats: { total, optionCounts, freetextCount } });
});


