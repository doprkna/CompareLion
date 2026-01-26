/**
 * AURE Interaction Engine - Current Battle API
 * Get current faction battle
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getCurrentBattle } from '@/lib/aure/interaction/battleService';
import { ARCHETYPE_CATALOG } from '@/lib/aure/life/archetypes';

/**
 * GET /api/aure/interaction/battles/current
 * Get current faction battle
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  try {
    const battle = await getCurrentBattle();

    if (!battle) {
      return successResponse({
        weekRange: null,
        archetypes: [],
        winnerArchetypeId: null,
      });
    }

    // Format archetypes with scores
    const archetypes = battle.archetypeIds.map((archetypeId) => {
      const archetype = ARCHETYPE_CATALOG.find((a) => a.id === archetypeId);
      return {
        id: archetypeId,
        label: archetype?.label || archetypeId,
        emoji: archetype?.emoji || '❓',
        score: battle.scores[archetypeId] || 0,
      };
    });

    // Calculate total score for percentage
    const totalScore = Object.values(battle.scores).reduce((a, b) => a + b, 0);

    // Add percentage to each archetype
    const archetypesWithPercent = archetypes.map((arch) => ({
      ...arch,
      percentage: totalScore > 0 ? Math.round((arch.score / totalScore) * 100) : 0,
    }));

    return successResponse({
      weekRange: {
        start: battle.weekStart.toISOString(),
        end: battle.weekEnd.toISOString(),
      },
      archetypes: archetypesWithPercent,
      winnerArchetypeId: battle.winnerArchetypeId,
    });
  } catch (error: any) {
    return successResponse({
      weekRange: null,
      archetypes: [],
      winnerArchetypeId: null,
    });
  }
});
