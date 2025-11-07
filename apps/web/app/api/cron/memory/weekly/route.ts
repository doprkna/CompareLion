import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';
import { generateMemoryMarkdown } from '@/lib/memory/summarizer';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Eligible users: with subscription or badge
  const eligibleUsers = await prisma.user.findMany({
    where: {
      OR: [
        { subscriptions: { some: {} } } as any,
        { userBadges: { some: { badgeId: 'achievement.memory_unlocked' } } },
      ]
    },
    select: { id: true },
    take: 1000,
  });

  let generated = 0;
  for (const u of eligibleUsers) {
    const reflections = await prisma.userReflection.findMany({ where: { userId: u.id, createdAt: { gte: weekAgo, lte: now } }, orderBy: { createdAt: 'desc' }, select: { content: true, summary: true, sentiment: true, createdAt: true } });
    if (reflections.length < 3) continue;
    const member = await prisma.groupMember.findFirst({ where: { userId: u.id }, select: { groupId: true } });
    let stats: any = null;
    if (member?.groupId) {
      const gs = await prisma.groupStat.findFirst({ where: { groupId: member.groupId }, orderBy: { updatedAt: 'desc' } });
      if (gs) stats = { totalXP: gs.totalXP, avgLevel: gs.avgLevel, reflections: gs.reflections };
    }
    const firesideReacts = await prisma.firesideReaction.count({ where: { userId: u.id, createdAt: { gte: weekAgo, lte: now } } });
    const pollVotes = await prisma.pollResponse.count({ where: { userId: u.id, createdAt: { gte: weekAgo, lte: now } } });

    const result = generateMemoryMarkdown({ reflections, stats, firesides: { count: firesideReacts }, polls: { votes: pollVotes }, periodStart: weekAgo, periodEnd: now });
    await prisma.memoryJournal.create({ data: { userId: u.id, title: result.title, summary: result.summary, content: result.content, periodStart: weekAgo, periodEnd: now, sourceCount: result.sourceCount } });
    generated++;
  }

  return NextResponse.json({ success: true, generated });
});


