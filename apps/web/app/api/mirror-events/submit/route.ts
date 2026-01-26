import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import { z } from 'zod';

const SubmitReflectionSchema = z.object({
  mirrorEventId: z.string().min(1),
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0),
    content: z.string().min(1).max(5000),
  })),
});

/**
 * POST /api/mirror-events/submit
 * Store user's answers for active mirror event
 * Auth required
 * v0.29.12 - Mirror Events
 * v0.41.6 - C3 Step 7: Unified API envelope
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SubmitReflectionSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string[]> = {};
    parsed.error.errors.forEach((err) => {
      const path = err.path.join('.') || 'root';
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Invalid payload', { details });
  }

  const { mirrorEventId, answers } = parsed.data;

  // Verify mirror event exists and is active
  const now = new Date();
  const mirrorEvent = await prisma.mirrorEvent.findUnique({
    where: { id: mirrorEventId },
  });

  if (!mirrorEvent) {
    return buildError(req, ApiErrorCode.NOT_FOUND, 'Mirror event not found');
  }

  if (!mirrorEvent.active || mirrorEvent.startDate > now || mirrorEvent.endDate < now) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Event is not currently active');
  }

  // Check if user already submitted for this event
  const existingSubmission = await prisma.userReflection.findFirst({
    where: {
      userId: user.id,
      mirrorEventId: mirrorEvent.id,
    },
  });

  if (existingSubmission) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Already submitted reflection for this event');
  }

  // Validate answers match question set
  if (answers.length !== mirrorEvent.questionSet.length) {
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Expected answers, got ' + answers.length + ', but question set has ' + mirrorEvent.questionSet.length);
  }

  // Create reflection(s) for each answer
  const createdReflections = await Promise.all(
    answers.map((answer, index) =>
      prisma.userReflection.create({
        data: {
          userId: user.id,
          type: 'DAILY',
          content: answer.content,
          summary: answer.content.slice(0, 200),
          metadata: {
            mirrorEventId: mirrorEvent.id,
            questionIndex: answer.questionIndex,
            question: mirrorEvent.questionSet[answer.questionIndex],
          },
          mirrorEventId: mirrorEvent.id,
        },
      })
    )
  );

  // Grant rewards
  let badgeGranted = false;
  if (mirrorEvent.rewardXP > 0 || mirrorEvent.rewardBadgeId) {
    await prisma.$transaction(async (tx) => {
      // Grant XP
      if (mirrorEvent.rewardXP > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            xp: (user.xp || 0) + mirrorEvent.rewardXP,
          },
        });
      }

      // Grant badge if specified
      if (mirrorEvent.rewardBadgeId) {
        const existingBadge = await tx.userBadge.findUnique({
          where: {
            userId_badgeId: {
              userId: user.id,
              badgeId: mirrorEvent.rewardBadgeId,
            },
          },
        });

        if (!existingBadge) {
          await tx.userBadge.create({
            data: {
              userId: user.id,
              badgeId: mirrorEvent.rewardBadgeId,
              unlockedAt: new Date(),
              isClaimed: false,
            },
          });
          badgeGranted = true;
        }
      }
    });
  }

  return buildSuccess(req, {
    reflections: createdReflections.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
    })),
    rewards: {
      xp: mirrorEvent.rewardXP,
      badgeGranted,
    },
    message: badgeGranted
      ? `dYZ% Reflection submitted! Earned ${mirrorEvent.rewardXP} XP and a badge!`
      : `�o. Reflection submitted! Earned ${mirrorEvent.rewardXP} XP!`,
  });
});


