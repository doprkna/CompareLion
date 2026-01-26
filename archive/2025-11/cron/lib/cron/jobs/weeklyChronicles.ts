/**
 * Weekly Chronicles Job Handler (v0.29.21)
 * 
 * Auto-generate weekly user chronicles
 */

import { prisma } from '@/lib/db';

export async function runWeeklyChronicles(): Promise<void> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Eligible users: with subscription or badge
  const eligibleUsers = await prisma.user.findMany({
    where: {
      OR: [
        { subscriptions: { some: {} } } as any,
        { userBadges: { some: { badgeId: 'achievement.memory_unlocked' } } },
      ],
    },
    select: { id: true },
    take: 1000,
  });

  for (const u of eligibleUsers) {
    const reflections = await prisma.userReflection.findMany({
      where: {
        userId: u.id,
        createdAt: { gte: weekAgo, lte: now },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        content: true,
        summary: true,
        sentiment: true,
        createdAt: true,
      },
    });

    if (reflections.length < 3) continue;

    const member = await prisma.groupMember.findFirst({
      where: { userId: u.id },
      select: { groupId: true },
    });

    let stats: any = null;
    if (member?.groupId) {
      const gs = await prisma.groupStat.findFirst({
        where: { groupId: member.groupId },
        orderBy: { updatedAt: 'desc' },
      });
      if (gs) stats = { totalXP: gs.totalXP, avgLevel: gs.avgLevel, reflections: gs.reflections };
    }

    const firesideReacts = await prisma.firesideReaction.count({
      where: { userId: u.id, createdAt: { gte: weekAgo, lte: now } },
    });

    const pollVotes = await prisma.pollResponse.count({
      where: { userId: u.id, createdAt: { gte: weekAgo, lte: now } },
    });

    // Import and use the summarizer if available, otherwise create basic summary
    // This is a simplified version - you may need to import from '@/lib/memory/summarizer'
    const title = `Week of ${weekAgo.toLocaleDateString()}`;
    const summary = `Reflected ${reflections.length} times, engaged in ${firesideReacts} firesides, voted in ${pollVotes} polls.`;
    const content = reflections.map((r) => r.content || r.summary || '').join('\n\n');

    await prisma.memoryJournal.create({
      data: {
        userId: u.id,
        title,
        summary,
        content,
        periodStart: weekAgo,
        periodEnd: now,
        sourceCount: reflections.length + firesideReacts + pollVotes,
      },
    });
  }
}

