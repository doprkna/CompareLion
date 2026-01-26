/**
 * Flow Answer API
 * Records user's answer to a question
 * v0.13.2i - Enhanced from previous version
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError } from '@/lib/api-handler';
import { recordFlowAnswer, getUserFlowStats } from '@/lib/services/flowService';
import { addXP, updateHeroStats } from '@/lib/services/progressionService';
import { publishEvent } from '@/lib/realtime';
import { z } from 'zod';

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';

const FlowAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionIds: z.array(z.string()).optional(),
  textValue: z.string().optional(),
  numericValue: z.number().optional(),
  skipped: z.boolean().optional().default(false),
});

/**
 * POST /api/flow/answer
 * Submit answer to a flow question
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, questionsAnswered: true, xp: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Parse and validate request
  const body = await req.json();
  const { questionId, optionIds, textValue, numericValue, skipped } = FlowAnswerSchema.parse(body);

  // Record the answer
  await recordFlowAnswer({
    questionId,
    userId: user.id,
    optionIds,
    textValue,
    numericValue,
    skipped: skipped || false,
  });

  // Grant XP if not skipped (10 XP per answer)
  let xpResult = null;
  if (!skipped) {
    const xpReward = 10;
    xpResult = await addXP(user.id, xpReward, 'flow_answer');
    
    // Update hero stats (base + level + equipment bonuses)
    await updateHeroStats(user.id);
    
    // Publish XP update event for UI
    await publishEvent('xp:update', {
      userId: user.id,
      newXp: xpResult.xp,
      newLevel: xpResult.level,
      leveledUp: xpResult.leveledUp,
      xpGained: xpReward,
    });
  }

  // Get updated stats
  const stats = await getUserFlowStats(user.id);

  return NextResponse.json({
    success: true,
    message: skipped ? 'Question skipped' : 'Answer recorded',
    stats: {
      totalAnswered: stats.totalAnswered,
      todayAnswered: stats.todayAnswered,
      xpGained: skipped ? 0 : 10,
    },
    level: xpResult?.level,
    leveledUp: xpResult?.leveledUp || false,
  });
});
