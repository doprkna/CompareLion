import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
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
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
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
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SubmitReflectionSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { mirrorEventId, answers } = parsed.data;

  // Verify mirror event exists and is active
  const now = new Date();
  const mirrorEvent = await prisma.mirrorEvent.findUnique({
    where: { id: mirrorEventId },
  });

  if (!mirrorEvent) {
    return notFoundError('Mirror event not found');
  }

  if (!mirrorEvent.active || mirrorEvent.startDate > now || mirrorEvent.endDate < now) {
    return validationError('Event is not currently active');
  }

  // Check if user already submitted for this event
  const existingSubmission = await prisma.userReflection.findFirst({
    where: {
      userId: user.id,
      mirrorEventId: mirrorEvent.id,
    },
  });

  if (existingSubmission) {
    return validationError('Already submitted reflection for this event');
  }

  // Validate answers match question set
  if (answers.length !== mirrorEvent.questionSet.length) {
    return validationError(`Expected ${mirrorEvent.questionSet.length} answers, got ${answers.length}`);
  }

  // Create reflection(s) for each answer
  const createdReflections = await prisma.$transaction(
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

  return successResponse({
    success: true,
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
      ? `🎉 Reflection submitted! Earned ${mirrorEvent.rewardXP} XP and a badge!`
      : `✅ Reflection submitted! Earned ${mirrorEvent.rewardXP} XP!`,
  });
});

