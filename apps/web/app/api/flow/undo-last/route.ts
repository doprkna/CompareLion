/**
 * POST /api/flow/undo-last
 * Revert the most recent answer in the flow session and subtract XP.
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getFlowUser } from '@/lib/flow-auth';
import { safeAsync, authError, successResponse, validationError } from '@/lib/api-handler';
import { getLevelFromXP } from '@/lib/levelCurve';
import { z } from 'zod';

export const runtime = 'nodejs';

const UndoSchema = z.object({
  categoryId: z.string().min(1),
});

const XP_PER_ANSWER = 10;

export const POST = safeAsync(async (req: NextRequest) => {
  const flowUser = await getFlowUser(req);
  if (!flowUser) return authError();

  const body = await req.json().catch(() => ({}));
  const parsed = UndoSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('categoryId required');
  }
  const { categoryId } = parsed.data;

  const lastResponse = await prisma.userResponse.findFirst({
    where: {
      userId: flowUser.id,
      skipped: false,
      question: { categoryId },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      question: {
        include: {
          options: { orderBy: { order: 'asc' } },
          category: { select: { name: true } },
        },
      },
    },
  });

  if (!lastResponse) {
    return validationError('No answer to undo');
  }

  await prisma.$transaction(async (tx) => {
    await tx.userResponse.delete({
      where: { id: lastResponse.id },
    });

    const user = await tx.user.findUnique({
      where: { id: flowUser.id },
      select: { xp: true, questionsAnswered: true, streakCount: true, lastAnsweredAt: true },
    });
    if (!user) return;

    const newXp = Math.max(0, Number(user.xp) - XP_PER_ANSWER);
    const newLevel = getLevelFromXP(newXp);

    await tx.user.update({
      where: { id: flowUser.id },
      data: {
        xp: newXp,
        level: newLevel,
        questionsAnswered: { decrement: 1 },
      },
    });
  });

  const question = lastResponse.question;
  const restoredQuestion = {
    id: question.id,
    text: question.text,
    type: question.type,
    difficulty: 'medium',
    categoryName: question.category?.name ?? 'Unknown',
    challengeEnabled: question.challengeEnabled ?? false,
    options: question.options.map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value,
      order: o.order,
    })),
  };

  return successResponse({
    question: restoredQuestion,
    restored: true,
  });
});
