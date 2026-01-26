/**
 * AURE Life Engine - Archetype API 2.0
 * Get user archetype with nearby archetypes
 * v0.39.5 - Archetype Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getUserArchetype, getNearbyArchetypes } from '@/lib/aure/life/archetypeService';
import { getArchetypeById } from '@/lib/aure/life/archetypes';

/**
 * GET /api/aure/life/archetype
 * Get user archetype with nearby archetypes
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
    const archetype = await getUserArchetype(user.id);
    const nearbyArchetypes = await getNearbyArchetypes(user.id);

    if (!archetype) {
      return successResponse({
        archetype: null,
        nearbyArchetypes: [],
        message: 'Archetype not yet detected',
      });
    }

    // Get full archetype details from catalog
    const archetypeDetails = getArchetypeById(archetype.archetypeId);
    const previousArchetypeDetails = archetype.previousArchetypeId
      ? getArchetypeById(archetype.previousArchetypeId)
      : null;

    return successResponse({
      archetype: {
        archetypeId: archetype.archetypeId,
        label: archetypeDetails?.label || archetype.archetypeId,
        emoji: archetypeDetails?.emoji || '🎭',
        confidence: archetype.confidence,
        description: archetype.description || archetypeDetails?.shortDescription,
        updatedAt: archetype.updatedAt.toISOString(),
        previousArchetypeId: archetype.previousArchetypeId,
        previousArchetypeLabel: previousArchetypeDetails?.label,
        changeReason: archetype.changeReason,
      },
      nearbyArchetypes: nearbyArchetypes.map((n) => ({
        archetypeId: n.archetypeId,
        label: n.label,
        emoji: n.emoji,
        similarity: n.similarity,
      })),
    });
  } catch (error: any) {
    return successResponse({
      archetype: null,
      nearbyArchetypes: [],
      error: error.message || 'Failed to load archetype',
    });
  }
});

