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
import { addXP, updateHeroStats } from '@/lib/services/progressionService';
import { publishEvent } from '@/lib/realtime';

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

  // Grant XP (100 XP for reflection) and handle level-up
  const xpReward = 100;
  const xpResult = await addXP(user.id, xpReward, 'question_answer');
  
  // Add battlepass XP (v0.36.28)
  try {
    const { addBattlePassXP } = await import('@/lib/services/battlepassService');
    const { updateMissionProgress } = await import('@/lib/services/missionService');
    await addBattlePassXP(user.id, 50); // +50 XP for question
    await updateMissionProgress(user.id, 'daily_answer_question', 1);
    await updateMissionProgress(user.id, 'weekly_answer_questions', 1);
  } catch (error) {
    logger.debug('[QuestionAnswer] Battlepass XP failed', error);
  }
  
  // Update hero stats (base + level + equipment bonuses)
  await updateHeroStats(user.id);
  
  // Update questions answered count
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      questionsAnswered: { increment: 1 },
    },
    select: {
      questionsAnswered: true,
    },
  });

  // Create feed post for question answered (v0.36.25)
  try {
    const { postQuestionAnswered, postQuestionMilestone } = await import('@/lib/services/feedService');
    await postQuestionAnswered(user.id, questionTemplateId);
    
    // Check for milestone (every 5 questions)
    if (updatedUser.questionsAnswered > 0 && updatedUser.questionsAnswered % 5 === 0) {
      await postQuestionMilestone(user.id, updatedUser.questionsAnswered);
    }
  } catch (error) {
    // Don't fail question answer if feed post fails
    logger.debug('[QuestionAnswer] Feed post failed', error);
  }

  // Create ComparePost for social compare feed (v0.36.31)
  try {
    const { createComparePostFromAnswer } = await import('@/lib/services/feedService');
    await createComparePostFromAnswer(user.id, questionTemplateId, answer);
  } catch (error) {
    // Don't fail question answer if compare post fails
    logger.debug('[QuestionAnswer] Compare post failed', error);
  }

  // Grant pet XP (v0.36.32) - +1 XP for answering a question
  try {
    const { grantXPToAllUserPets } = await import('@/lib/services/petService');
    await grantXPToAllUserPets(user.id, 1);
  } catch (error) {
    logger.debug('[QuestionAnswer] Pet XP grant failed', error);
  }

  // Create notification for question answered (v0.36.26)
  try {
    const { notifyQuestionAnswered } = await import('@/lib/services/notificationService');
    const category = userQuestion.questionTemplate?.category || undefined;
    await notifyQuestionAnswered(user.id, category);
  } catch (error) {
    // Don't fail question answer if notification fails
    logger.debug('[QuestionAnswer] Notification failed', error);
  }

  // Publish XP update event for UI
  await publishEvent('xp:update', {
    userId: user.id,
    newXp: xpResult.xp,
    newLevel: xpResult.level,
    leveledUp: xpResult.leveledUp,
    xpGained: xpReward,
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
    level: xpResult.level,
    leveledUp: xpResult.leveledUp,
  });
});

