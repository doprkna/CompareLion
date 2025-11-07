import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const CompleteSchema = z.object({
  testId: z.string().min(1),
});

function calculateCompatibility(answersA: any[], answersB: any[]): number {
  if (!answersA?.length || !answersB?.length || answersA.length !== answersB.length) return 0;
  let matches = 0;
  for (let i = 0; i < answersA.length; i++) {
    if (JSON.stringify(answersA[i]) === JSON.stringify(answersB[i])) {
      matches++;
    }
  }
  return (matches / answersA.length) * 100;
}

function getResultText(score: number): string {
  if (score >= 80) return 'Soul-sync achieved. You two might start a cult.';
  if (score >= 50) return 'Respectful disagreement level.';
  return 'Opposites attract... or destroy universes.';
}

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

  const userTest = await prisma.userSynchTest.findUnique({
    where: { id: parsed.data.testId },
    include: { test: true },
  });

  if (!userTest) return notFoundError('Test not found');
  if (userTest.status !== 'pending') return validationError('Test already completed or expired');

  const answersA = Array.isArray(userTest.answersA) ? userTest.answersA : [];
  const answersB = Array.isArray(userTest.answersB) ? userTest.answersB : [];

  if (!answersA.length || !answersB.length) {
    return validationError('Both users must submit answers');
  }

  if (userTest.userA !== user.id && userTest.userB !== user.id) {
    return unauthorizedError('Not your test');
  }

  const compatibilityScore = calculateCompatibility(answersA, answersB);
  const resultText = getResultText(compatibilityScore);

  await prisma.$transaction(async (tx) => {
    await tx.userSynchTest.update({
      where: { id: userTest.id },
      data: {
        compatibilityScore,
        status: 'completed',
      },
    });

    // Award rewards
    if (userTest.test.rewardXP > 0) {
      await tx.user.updateMany({
        where: { id: { in: [userTest.userA, userTest.userB] } },
        data: { xp: { increment: userTest.test.rewardXP } },
      });
    }
    if (userTest.test.rewardKarma > 0) {
      await tx.user.updateMany({
        where: { id: { in: [userTest.userA, userTest.userB] } },
        data: { karmaScore: { increment: userTest.test.rewardKarma } },
      });
    }

    // Log actions
    await tx.actionLog.createMany({
      data: [
        {
          userId: userTest.userA,
          action: 'synch_test_completed',
          metadata: { testId: userTest.id, score: compatibilityScore } as any,
        },
        {
          userId: userTest.userB,
          action: 'synch_test_completed',
          metadata: { testId: userTest.id, score: compatibilityScore } as any,
        },
      ],
    });
  });

  return NextResponse.json({
    success: true,
    result: {
      score: compatibilityScore,
      resultText,
      testId: userTest.id,
    },
  });
});

