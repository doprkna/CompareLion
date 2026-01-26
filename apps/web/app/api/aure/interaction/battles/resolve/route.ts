/**
 * AURE Interaction Engine - Resolve Battle API
 * Manually resolve a battle and determine winner
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { resolveBattle, getCurrentBattle } from '@/lib/aure/interaction/battleService';

/**
 * POST /api/aure/interaction/battles/resolve
 * Resolve current battle (dev/admin only - can be guarded by env)
 * Body: { battleId?: string } - if not provided, resolves current battle
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  // Simple guard: check if in development or if env allows
  // In production, you might want to check user role here
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_BATTLE_RESOLVE) {
    return unauthorizedError('Battle resolution not allowed in production');
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { battleId } = body;

    let targetBattleId = battleId;

    // If no battleId provided, get current battle
    if (!targetBattleId) {
      const currentBattle = await getCurrentBattle();
      if (!currentBattle) {
        return validationError('No active battle found');
      }
      targetBattleId = currentBattle.id;
    }

    const result = await resolveBattle(targetBattleId);

    if (!result.success) {
      return validationError('Failed to resolve battle');
    }

    return successResponse({
      success: true,
      winnerArchetypeId: result.winnerArchetypeId,
      scores: result.scores,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to resolve battle');
  }
});

