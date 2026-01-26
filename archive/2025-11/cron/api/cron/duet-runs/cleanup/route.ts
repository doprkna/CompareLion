import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  const now = new Date();

  // Find all active runs that have exceeded their duration
  const expiredRuns = await prisma.userDuetRun.findMany({
    where: {
      status: { in: ['pending', 'active'] },
    },
    include: { run: true },
  });

  const toExpire: string[] = [];
  const toComplete: string[] = [];

  for (const run of expiredRuns) {
    const startedAt = new Date(run.startedAt);
    const elapsed = (now.getTime() - startedAt.getTime()) / 1000; // seconds
    const durationSec = run.run.durationSec;

    if (elapsed > durationSec) {
      // Both completed = mark as completed, grant full rewards
      if (run.progressA >= 100 && run.progressB >= 100) {
        toComplete.push(run.id);
      } else {
        // Expired - grant partial credit (half XP)
        toExpire.push(run.id);
      }
    }
  }

  // Process completed runs
  for (const runId of toComplete) {
    const run = expiredRuns.find((r) => r.id === runId);
    if (!run) continue;

    const baseXP = run.run.rewardXP;
    const baseKarma = run.run.rewardKarma;
    // No synergy bonus if expired

    await prisma.$transaction(async (tx) => {
      await tx.userDuetRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          endedAt: now,
        },
      });

      await tx.user.update({
        where: { id: run.userA },
        data: {
          xp: { increment: baseXP },
          karmaScore: { increment: baseKarma },
        },
      });

      await tx.user.update({
        where: { id: run.userB },
        data: {
          xp: { increment: baseXP },
          karmaScore: { increment: baseKarma },
        },
      });
    }).catch(() => {});
  }

  // Process expired runs (partial credit)
  for (const runId of toExpire) {
    const run = expiredRuns.find((r) => r.id === runId);
    if (!run) continue;

    const baseXP = run.run.rewardXP;
    const baseKarma = run.run.rewardKarma;
    const partialXP = Math.round(baseXP * 0.5);
    const partialKarma = Math.round(baseKarma * 0.5);

    await prisma.$transaction(async (tx) => {
      await tx.userDuetRun.update({
        where: { id: runId },
        data: {
          status: 'expired',
          endedAt: now,
        },
      });

      // Grant partial rewards to both users
      await tx.user.update({
        where: { id: run.userA },
        data: {
          xp: { increment: partialXP },
          karmaScore: { increment: partialKarma },
        },
      });

      await tx.user.update({
        where: { id: run.userB },
        data: {
          xp: { increment: partialXP },
          karmaScore: { increment: partialKarma },
        },
      });
    }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    expired: toExpire.length,
    completed: toComplete.length,
    total: expiredRuns.length,
  });
});

