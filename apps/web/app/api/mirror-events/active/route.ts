import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess } from '@parel/api';
import type { MirrorEventDTO, MirrorEventResponseDTO } from '@parel/types/dto';

/**
 * GET /api/mirror-events/active
 * Returns current active mirror event with questions
 * v0.29.12 - Mirror Events
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 * v0.41.6 - C3 Step 7: Unified API envelope
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Get current active mirror event
  const now = new Date();
  const activeEvent = await prisma.mirrorEvent.findFirst({
    where: {
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    orderBy: { startDate: 'desc' },
  });

  if (!activeEvent) {
    const response: MirrorEventResponseDTO = {
      event: null,
      message: 'No active mirror event',
    };
    return buildSuccess(req, response);
  }

  // Get global mood for tone adaptation
  const globalMood = await prisma.globalMood.findFirst({
    orderBy: { updatedAt: 'desc' },
    select: {
      dominantEmotion: true,
    },
  });

  // Calculate time remaining
  const timeRemaining = activeEvent.endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));

  const eventData: MirrorEventDTO = {
      id: activeEvent.id,
      key: activeEvent.key,
      title: activeEvent.title,
      description: activeEvent.description,
      theme: activeEvent.theme,
      startDate: activeEvent.startDate,
      endDate: activeEvent.endDate,
      questionSet: activeEvent.questionSet,
      rewardXP: activeEvent.rewardXP,
      rewardBadgeId: activeEvent.rewardBadgeId,
      timeRemaining,
      daysRemaining,
    globalMood: globalMood?.dominantEmotion || 'calm',
  };

  const response: MirrorEventResponseDTO = {
    event: eventData,
  };

  return buildSuccess(req, response);
});

