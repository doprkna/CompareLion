/**
 * Select Archetype API
 * Allows user to select or change their archetype
 * v0.26.6 - Archetypes & Leveling
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { selectArchetype } from '@/lib/services/progressionService';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';

/**
 * POST /api/progression/select-archetype
 * Select an archetype for the user
 * Body: { archetypeKey: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody<{ archetypeKey: string }>(req);

  if (!body.archetypeKey) {
    return validationError('Missing required field: archetypeKey');
  }

  try {
    const result = await selectArchetype(user.id, body.archetypeKey);

    return successResponse({
      success: true,
      message: `Archetype selected: ${body.archetypeKey}`,
      stats: result.stats,
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to select archetype'
    );
  }
});

