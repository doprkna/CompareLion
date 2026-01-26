/**
 * AURE Interaction Engine - Faction Battle Contribution API
 * Contribute to faction battle
 * v0.39.2 - AURE Interaction Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { recordFactionContribution } from '@/lib/aure/interaction/battlesService';

/**
 * POST /api/aure/interaction/battles/contribute
 * Contribute to faction battle
 * Body: { archetypeId: string, amount?: number }
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
  const { archetypeId, amount = 1 } = body;

  if (!archetypeId) {
    return validationError('archetypeId is required');
  }

  try {
    const result = await recordFactionContribution(user.id, archetypeId, amount);

    return successResponse({
      success: result.success,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to contribute to battle');
  }
});

