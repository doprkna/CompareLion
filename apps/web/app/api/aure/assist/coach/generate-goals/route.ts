/**
 * AURE Assist Engine - Generate Coach Goals API 2.0
 * Generate improvement goals
 * v0.39.9 - Coach 2.0 (Adaptive + Premium-ready)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, forbiddenError, successResponse } from '@/lib/api-handler';
import { generateCoachGoals, CoachType } from '@/lib/aure/assist/coachService';

/**
 * POST /api/aure/assist/coach/generate-goals
 * Generate improvement goals (premium-only)
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
    const goals = await generateCoachGoals(user.id, type);

    // Check if premium required
    if ('error' in goals && goals.error === 'premium_required') {
      return forbiddenError('Coach is a premium feature. Upgrade to access personalized coaching.');
    }

    return successResponse({
      success: true,
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetMetric: goal.targetMetric,
        targetDelta: goal.targetDelta,
        progress: goal.progress,
        createdAt: goal.createdAt.toISOString(),
        completedAt: goal.completedAt?.toISOString() || null,
      })),
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate coach goals');
  }
});

