import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { generateMemoryMarkdown } from '@/lib/memory/summarizer';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (!user) return unauthorizedError('Unauthorized');

  // Eligibility: premium/subscription or achievement; allow admins
  const isEligible = !!(await prisma.subscription?.findFirst?.({ where: { userId: user.id } } as any).catch?.(() => null)) || user.role === 'ADMIN' || !!(await prisma.userBadge.findFirst({ where: { userId: user.id, badgeId: 'achievement.memory_unlocked' } }).catch(() => null));
  if (!isEligible) return validationError('Feature locked');

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const reflections = await prisma.userReflection.findMany({ where: { userId: user.id, createdAt: { gte: weekAgo, lte: now } }, orderBy: { createdAt: 'desc' }, select: { content: true, summary: true, sentiment: true, createdAt: true } });
  if (reflections.length < 3) return validationError('Not enough reflections');

  // Basic stats (optional): group membership first group
  const member = await prisma.groupMember.findFirst({ where: { userId: user.id }, select: { groupId: true } });
  let stats: any = null;
  if (member?.groupId) {
    const gs = await prisma.groupStat.findFirst({ where: { groupId: member.groupId }, orderBy: { updatedAt: 'desc' } });
    if (gs) stats = { totalXP: gs.totalXP, avgLevel: gs.avgLevel, reflections: gs.reflections };
  }

  const firesideReacts = await prisma.firesideReaction.count({ where: { userId: user.id, createdAt: { gte: weekAgo, lte: now } } });
  const pollVotes = await prisma.pollResponse.count({ where: { userId: user.id, createdAt: { gte: weekAgo, lte: now } } });

  const result = generateMemoryMarkdown({ reflections, stats, firesides: { count: firesideReacts }, polls: { votes: pollVotes }, periodStart: weekAgo, periodEnd: now });

  const entry = await prisma.memoryJournal.create({
    data: {
      userId: user.id,
      title: result.title,
      summary: result.summary,
      content: result.content,
      periodStart: weekAgo,
      periodEnd: now,
      sourceCount: result.sourceCount,
    },
  });

  return NextResponse.json({ success: true, entry });
});


