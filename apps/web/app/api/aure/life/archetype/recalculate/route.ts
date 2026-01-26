/**
 * AURE Life Engine - Recalculate Archetype API
 * Force recalculation of user archetype (rate-limited)
 * v0.39.5 - Archetype Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { recalculateUserArchetype, getNearbyArchetypes } from '@/lib/aure/life/archetypeService';
import { getArchetypeById } from '@/lib/aure/life/archetypes';

// Simple rate limiting: track last recalculation per user (in-memory)
const lastRecalculation: Record<string, number> = {};
const RECALCULATION_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

/**
 * POST /api/aure/life/archetype/recalculate
 * Force recalculation of archetype (rate-limited to once per hour)
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

  // Rate limiting check
  const lastRecalc = lastRecalculation[user.id];
  const now = Date.now();
  if (lastRecalc && now - lastRecalc < RECALCULATION_COOLDOWN_MS) {
    const remainingMinutes = Math.ceil((RECALCULATION_COOLDOWN_MS - (now - lastRecalc)) / 60000);
    return validationError(`Please wait ${remainingMinutes} minute(s) before recalculating again`);
  }

  try {
    const archetype = await recalculateUserArchetype(user.id);
    const nearbyArchetypes = await getNearbyArchetypes(user.id);

    // Update rate limit
    lastRecalculation[user.id] = now;

    // Get full archetype details from catalog
    const archetypeDetails = getArchetypeById(archetype.archetypeId);
    const previousArchetypeDetails = archetype.previousArchetypeId
      ? getArchetypeById(archetype.previousArchetypeId)
      : null;

    return successResponse({
      success: true,
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
    return validationError(error.message || 'Failed to recalculate archetype');
  }
});

