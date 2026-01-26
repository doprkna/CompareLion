/**
 * AURE Interaction Engine - AI vs Human Battle API
 * Create AI vs Human battle
 * v0.39.2 - AURE Interaction Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createAiHumanBattle } from '@/lib/aure/interaction/aivsHumanService';

/**
 * POST /api/aure/interaction/aivshuman
 * Create AI vs Human battle
 * Body: { leftRequestId: string, rightRequestId: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const { leftRequestId, rightRequestId } = body;

  if (!leftRequestId || !rightRequestId) {
    return validationError('leftRequestId and rightRequestId are required');
  }

  try {
    const battle = await createAiHumanBattle(leftRequestId, rightRequestId);

    return successResponse({
      success: true,
      battle: {
        id: battle.id,
        leftRequestId: battle.leftRequestId,
        rightRequestId: battle.rightRequestId,
        aiWinner: battle.aiWinner,
        humanVotesA: battle.humanVotesA,
        humanVotesB: battle.humanVotesB,
        createdAt: battle.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create AI vs Human battle');
  }
});

