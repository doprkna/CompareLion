/**
 * AURE Interaction Engine - My Contribution API
 * Get user's contribution to current battle
 * v0.39.7 - Faction Battle 2.0 (Archetype Wars)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserContribution } from '@/lib/aure/interaction/battleService';
import { ARCHETYPE_CATALOG } from '@/lib/aure/life/archetypes';

/**
 * GET /api/aure/interaction/battles/my-contribution
 * Get user's contribution to current battle
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  try {
    const contribution = await getUserContribution(user.id);

    if (!contribution.archetypeId) {
      return successResponse({
        archetypeId: null,
        archetypeLabel: null,
        totalContribution: 0,
        breakdown: {},
      });
    }

    const archetype = ARCHETYPE_CATALOG.find((a) => a.id === contribution.archetypeId);

    return successResponse({
      archetypeId: contribution.archetypeId,
      archetypeLabel: archetype?.label || contribution.archetypeId,
      totalContribution: contribution.totalContribution,
      breakdown: contribution.breakdown,
    });
  } catch (error: any) {
    return successResponse({
      archetypeId: null,
      archetypeLabel: null,
      totalContribution: 0,
      breakdown: {},
    });
  }
});

