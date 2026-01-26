/**
 * AURE Interaction Engine - AI vs Human Vote API
 * Vote on AI vs Human battle
 * v0.39.2 - AURE Interaction Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { voteOnAiHumanBattle } from '@/lib/aure/interaction/aivsHumanService';

/**
 * POST /api/aure/interaction/aivshuman/vote
 * Vote on AI vs Human battle
 * Body: { battleId: string, choice: 'left' | 'right' }
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
  const { battleId, choice } = body;

  if (!battleId || !choice) {
    return validationError('battleId and choice are required');
  }

  if (choice !== 'left' && choice !== 'right') {
    return validationError('choice must be "left" or "right"');
  }

  try {
    const result = await voteOnAiHumanBattle(user.id, battleId, choice);

    // Record faction contribution for VS participation (fire-and-forget)
    import('@/lib/aure/interaction/battleService')
      .then(({ recordFactionContribution }) => {
        return recordFactionContribution(user.id, 'vs', 1);
      })
      .catch(() => {
        // Silently fail - faction battles are optional
      });

    return successResponse({
      success: result.success,
      outcome: {
        battle: {
          id: result.outcome.battle.id,
          leftRequestId: result.outcome.battle.leftRequestId,
          rightRequestId: result.outcome.battle.rightRequestId,
          aiWinner: result.outcome.battle.aiWinner,
          humanVotesA: result.outcome.battle.humanVotesA,
          humanVotesB: result.outcome.battle.humanVotesB,
        },
        userAgreement: result.outcome.userAgreement,
        aiChoice: result.outcome.aiChoice,
        humanChoice: result.outcome.humanChoice,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to vote on battle');
  }
});

