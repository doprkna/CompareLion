/**
 * Voice Answer API
 * POST /api/answers/voice
 * Upload voice reply for a question
 * v0.37.9 - Voice Replies
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { saveAudioFile, validateAudioFile } from '@/lib/questions/voice/voiceUpload';
import { addXP, updateHeroStats } from '@/lib/services/progressionService';
import { publishEvent } from '@/lib/realtime';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/answers/voice
 * Upload voice reply (multipart/form-data)
 * Fields: questionId, audio
 */
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

  // Parse multipart form data
  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return validationError('Invalid form data');
  }

  const questionTemplateId = formData.get('questionId')?.toString();
  const audioFile = formData.get('audio') as File | null;

  if (!questionTemplateId) {
    return validationError('questionId is required');
  }

  if (!audioFile || !(audioFile instanceof File)) {
    return validationError('audio file is required');
  }

  // Validate audio file
  const validation = validateAudioFile(audioFile);
  if (!validation.valid) {
    return validationError(validation.error || 'Invalid audio file');
  }

  // Find the served question
  const userQuestion = await prisma.userQuestion.findFirst({
    where: {
      userId: user.id,
      questionTemplateId,
      status: 'served',
      answeredAt: null,
    },
    include: {
      questionTemplate: true,
    },
    orderBy: { servedAt: 'desc' },
  });

  if (!userQuestion) {
    return validationError('Question not found or already answered');
  }

  try {
    // Save audio file
    const audioUrl = await saveAudioFile(audioFile, user.id);

    // Update user question with answer
    await prisma.userQuestion.update({
      where: { id: userQuestion.id },
      data: {
        status: 'answered',
        answeredAt: new Date(),
      },
    });

    // Create reflection from voice answer
    // Store audioUrl in metadata, use placeholder text for content
    const reflection = await prisma.userReflection.create({
      data: {
        userId: user.id,
        type: 'DAILY',
        content: '[Voice reply]', // Placeholder text
        summary: 'Voice reply',
        sentiment: 'neutral',
        metadata: {
          questionTemplateId,
          questionText: userQuestion.questionTemplate?.text || '',
          source: 'question_answer',
          audioUrl, // Store audio URL in metadata
          isVoiceReply: true,
        },
      },
    });

    // Grant XP (100 XP for reflection) and handle level-up
    const xpReward = 100;
    const xpResult = await addXP(user.id, xpReward, 'question_answer');
    
    // Add battlepass XP
    try {
      const { addBattlePassXP } = await import('@/lib/services/battlepassService');
      const { updateMissionProgress } = await import('@/lib/services/missionService');
      await addBattlePassXP(user.id, 50);
      await updateMissionProgress(user.id, 'daily_answer_question', 1);
      await updateMissionProgress(user.id, 'weekly_answer_questions', 1);
    } catch (error) {
      logger.debug('[VoiceAnswer] Battlepass XP failed', error);
    }
    
    // Update hero stats
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

    // Create feed post for question answered
    try {
      const { postQuestionAnswered } = await import('@/lib/services/feedService');
      await postQuestionAnswered(user.id, questionTemplateId);
    } catch (error) {
      logger.debug('[VoiceAnswer] Feed post failed', error);
    }

    // Publish XP update event for UI
    await publishEvent('xp:update', {
      userId: user.id,
      newXp: xpResult.xp,
      newLevel: xpResult.level,
      leveledUp: xpResult.leveledUp,
      xpGained: xpReward,
    });

    return successResponse({
      success: true,
      reflection: {
        id: reflection.id,
        audioUrl,
      },
      rewards: {
        xp: xpReward,
        message: `Voice reply submitted (+${xpReward} XP)`,
      },
      level: xpResult.level,
      leveledUp: xpResult.leveledUp,
    });
  } catch (error) {
    logger.error('[VoiceAnswer] Failed to save voice reply', { error, userId: user.id, questionTemplateId });
    return validationError('Failed to save voice reply');
  }
});

