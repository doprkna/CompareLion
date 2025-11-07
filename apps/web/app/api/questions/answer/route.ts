/**
 * Answer Question API (v0.29.24)
 * 
 * POST /api/questions/answer
 * Logs user's response; triggers reflection + lore entry
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const AnswerSchema = z.object({
  questionTemplateId: z.string().min(1),
  answer: z.string().min(1).max(5000),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      archetypeKey: true,
      xp: true,
      level: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const validation = AnswerSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid request');
  }

  const { questionTemplateId, answer } = validation.data;

  // Find the served question
  const userQuestion = await prisma.userQuestion.findFirst({
    where: {
      userId: user.id,
      questionTemplateId,
      status: 'served',
      answeredAt: null,
    },
    include: {
      questionTemplate: true, // v0.29.24 - Include template relation
    },
    orderBy: { servedAt: 'desc' },
  });

  if (!userQuestion) {
    return validationError('Question not found or already answered');
  }

  // Update user question with answer
  await prisma.userQuestion.update({
    where: { id: userQuestion.id },
    data: {
      status: 'answered',
      answeredAt: new Date(),
    },
  });

  // Create reflection from answer
  const reflection = await prisma.userReflection.create({
    data: {
      userId: user.id,
      type: 'DAILY',
      content: answer,
      summary: answer.slice(0, 200),
      sentiment: 'neutral', // Can be enhanced with sentiment analysis
      metadata: {
        questionTemplateId,
        questionText: userQuestion.questionTemplate?.text || '',
        source: 'question_answer',
      },
    },
  });

  // Grant XP (100 XP for reflection)
  const xpReward = 100;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      xp: { increment: xpReward },
      questionsAnswered: { increment: 1 },
    },
  });

  // Create lore entry (optional - if question has lore tag)
  if (userQuestion.questionTemplate?.tags?.includes('lore')) {
    await prisma.userLoreEntry.create({
      data: {
        userId: user.id,
        sourceType: 'reflection',
        sourceId: reflection.id,
        tone: 'poetic', // Can be adjusted based on question tone
        text: answer.slice(0, 300), // Truncate to 300 chars for lore
      },
    });
  }

  return successResponse({
    success: true,
    reflection: {
      id: reflection.id,
      content: reflection.content,
      summary: reflection.summary,
    },
    rewards: {
      xp: xpReward,
      message: `Reflection submitted (+${xpReward} XP)`,
    },
  });
});

