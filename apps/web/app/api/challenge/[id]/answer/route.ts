/**
 * POST /api/challenge/[id]/answer - Submit answer for challenge
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError, notFoundError, validationError } from '@/lib/api-handler';
import { recordFlowAnswer } from '@/lib/services/flowService';
import { addXP, updateHeroStats } from '@/lib/services/progressionService';
import { publishEvent } from '@/lib/realtime';
import { z } from 'zod';

const CHALLENGE_XP_BONUS = 20;

const AnswerSchema = z.object({
  questionId: z.string(),
  optionIds: z.array(z.string()).optional(),
  textValue: z.string().optional(),
  numericValue: z.number().optional(),
  skipped: z.boolean().optional().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(req as NextRequest);
  if (!user) return authError();

  const { id: challengeId } = await params;

  const body = await req.json();
  const parsed = AnswerSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid answer payload');

  const { questionId, optionIds, textValue, numericValue, skipped } = parsed.data;

  const challenge = await prisma.questionChallenge.findUnique({
    where: { id: challengeId },
    include: { question: true },
  });
  if (!challenge) return notFoundError('Challenge not found');
  if (challenge.questionId !== questionId) return validationError('Question mismatch');
  if (challenge.status !== 'pending') {
    return successResponse({
      completed: challenge.status === 'completed',
      xpBonusGranted: challenge.xpGranted,
    });
  }

  await recordFlowAnswer({
    questionId,
    userId: user.id,
    optionIds,
    textValue,
    numericValue,
    skipped: skipped || false,
  });

  const response = await prisma.userResponse.findFirst({
    where: { userId: user.id, questionId },
    select: { id: true },
  });
  const answerId = response?.id;
  if (!answerId) return validationError('Answer not recorded');

  const isChallenger = user.id === challenge.challengerId;
  const update: Record<string, unknown> = {};

  if (isChallenger) {
    update.challengerAnswerId = answerId;
  } else {
    update.challengedId = user.id;
    update.challengedAnswerId = answerId;
  }

  const updated = await prisma.questionChallenge.update({
    where: { id: challengeId },
    data: update,
    select: {
      challengerAnswerId: true,
      challengedAnswerId: true,
      xpGranted: true,
      challengerId: true,
      challengedId: true,
    },
  });

  let completed = false;
  let xpBonusGranted = false;

  if (updated.challengerAnswerId && updated.challengedAnswerId) {
    completed = true;
    if (!updated.xpGranted) {
      await prisma.questionChallenge.update({
        where: { id: challengeId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          xpGranted: true,
        },
      });
      const userIds = new Set([updated.challengerId!, updated.challengedId!]);
      for (const uid of userIds) {
        await addXP(uid, CHALLENGE_XP_BONUS, 'challenge_complete');
        await updateHeroStats(uid);
        publishEvent('xp:update', { userId: uid, xpGained: CHALLENGE_XP_BONUS });
      }
      xpBonusGranted = true;
    }
  }

  return successResponse({
    completed,
    xpBonusGranted,
  });
}
