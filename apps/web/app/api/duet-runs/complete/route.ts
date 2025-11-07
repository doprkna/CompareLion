import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const CompleteSchema = z.object({
  duetRunId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Find duet run
  const duetRun = await prisma.userDuetRun.findUnique({
    where: { id: parsed.data.duetRunId },
    include: { run: true },
  });

  if (!duetRun) return notFoundError('Duet run not found');
  if (duetRun.status !== 'active') {
    return validationError('Duet run is not active');
  }

  // Check if user is part of this duet
  const isUserA = duetRun.userA === user.id;
  const isUserB = duetRun.userB === user.id;
  if (!isUserA && !isUserB) {
    return unauthorizedError('Not authorized for this duet run');
  }

  // Check if both completed
  const bothCompleted = duetRun.progressA >= 100 && duetRun.progressB >= 100;
  if (!bothCompleted) {
    return validationError('Both users must complete before finishing');
  }

  // Calculate rewards
  const now = new Date();
  const startedAt = new Date(duetRun.startedAt);
  const elapsed = (now.getTime() - startedAt.getTime()) / 1000; // seconds
  const durationSec = duetRun.run.durationSec;
  const finishedOnTime = elapsed <= durationSec;

  const baseXP = duetRun.run.rewardXP;
  const baseKarma = duetRun.run.rewardKarma;
  const synergyBonus = finishedOnTime ? 0.1 : 0; // 10% if on time

  const totalXP = Math.round(baseXP * (1 + synergyBonus));
  const totalKarma = Math.round(baseKarma * (1 + synergyBonus));

  // Update status and grant rewards
  await prisma.$transaction(async (tx) => {
    // Mark as completed
    await tx.userDuetRun.update({
      where: { id: duetRun.id },
      data: {
        status: 'completed',
        endedAt: now,
      },
    });

    // Grant rewards to both users
    await tx.user.update({
      where: { id: duetRun.userA },
      data: {
        xp: { increment: totalXP },
        karmaScore: { increment: totalKarma },
      },
    });

    await tx.user.update({
      where: { id: duetRun.userB },
      data: {
        xp: { increment: totalXP },
        karmaScore: { increment: totalKarma },
      },
    });

    // Log actions
    await tx.actionLog.create({
      data: {
        userId: duetRun.userA,
        action: 'duet_run_complete',
        metadata: {
          duetRunId: duetRun.id,
          xp: totalXP,
          karma: totalKarma,
          synergyBonus,
          finishedOnTime,
        } as any,
      },
    }).catch(() => {});

    await tx.actionLog.create({
      data: {
        userId: duetRun.userB,
        action: 'duet_run_complete',
        metadata: {
          duetRunId: duetRun.id,
          xp: totalXP,
          karma: totalKarma,
          synergyBonus,
          finishedOnTime,
        } as any,
      },
    }).catch(() => {});
  });

  return NextResponse.json({
    success: true,
    completed: true,
    rewards: {
      xp: totalXP,
      karma: totalKarma,
      synergyBonus: synergyBonus > 0,
      finishedOnTime,
    },
  });
});

