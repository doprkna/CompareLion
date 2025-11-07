import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const CompleteSchema = z.object({
  ritualId: z.string().min(1),
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

  // Find ritual
  const ritual = await prisma.ritual.findUnique({
    where: { id: parsed.data.ritualId },
  });
  if (!ritual || !ritual.isActive) return notFoundError('Ritual not found or inactive');

  // Get user's ritual progress
  const userRitual = await prisma.userRitual.findUnique({
    where: {
      userId_ritualId: {
        userId: user.id,
        ritualId: ritual.id,
      },
    },
  });

  // Check if already completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (userRitual?.lastCompleted) {
    const lastCompleted = new Date(userRitual.lastCompleted);
    const todayStart = new Date(today);
    if (lastCompleted >= todayStart) {
      return validationError('Ritual already completed today');
    }
  }

  // Calculate streak: +1 if last completed < 24h ago (within same day or yesterday), otherwise reset to 1
  const now = new Date();
  let newStreak = 1;

  if (userRitual?.lastCompleted) {
    const lastCompleted = new Date(userRitual.lastCompleted);
    const hoursSince = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60); // hours

    // If completed within last 24-48 hours, continue streak; otherwise reset
    if (hoursSince < 48) {
      newStreak = userRitual.streakCount + 1;
    } else {
      newStreak = 1; // Reset if more than 48 hours
    }
  }

  // Update or create user ritual and grant rewards
  await prisma.$transaction(async (tx) => {
    // Update or create user ritual
    await tx.userRitual.upsert({
      where: {
        userId_ritualId: {
          userId: user.id,
          ritualId: ritual.id,
        },
      },
      update: {
        lastCompleted: now,
        streakCount: newStreak,
        totalCompleted: { increment: 1 },
      },
      create: {
        userId: user.id,
        ritualId: ritual.id,
        lastCompleted: now,
        streakCount: newStreak,
        totalCompleted: 1,
      },
    });

    // Grant rewards
    await tx.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: ritual.rewardXP },
        karmaScore: { increment: ritual.rewardKarma },
      },
    });

    // Log action
    await tx.actionLog.create({
      data: {
        userId: user.id,
        action: 'ritual_complete',
        metadata: {
          ritualId: ritual.id,
          ritualKey: ritual.key,
          rewardXP: ritual.rewardXP,
          rewardKarma: ritual.rewardKarma,
          streakCount: newStreak,
        } as any,
      },
    }).catch(() => {});
  });

  return NextResponse.json({
    success: true,
    completed: true,
    rewards: {
      xp: ritual.rewardXP,
      karma: ritual.rewardKarma,
    },
    streakCount: newStreak,
    totalCompleted: (userRitual?.totalCompleted || 0) + 1,
  });
});

