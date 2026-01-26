/**
 * AURE Assist Engine - Update Goal Progress API 2.0
 * Update goal progress based on new ratings
 * v0.39.9 - Coach 2.0 (Adaptive + Premium-ready)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, forbiddenError, successResponse } from '@/lib/api-handler';
import { updateGoalProgress, CoachType } from '@/lib/aure/assist/coachService';

/**
 * POST /api/aure/assist/coach/update-progress
 * Update goal progress (premium-only)
 * Body: { type: CoachType }
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
  const { type } = body;

  if (!type) {
    return validationError('type is required (snack|desk|outfit|room|generic)');
  }

  const validTypes: CoachType[] = ['snack', 'desk', 'outfit', 'room', 'generic'];
  if (!validTypes.includes(type)) {
    return validationError(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  try {
    const result = await updateGoalProgress(user.id, type);

    // Check if premium required
    if ('error' in result && result.error === 'premium_required') {
      return forbiddenError('Coach is a premium feature. Upgrade to access personalized coaching.');
    }

    return successResponse({
      success: true,
      updated: result.updated,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to update goal progress');
  }
});

