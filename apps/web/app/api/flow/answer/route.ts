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
import { z } from 'zod';

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
  });
});
