/**
 * AURE Assist Engine - Coach Summary API 2.0
 * Get weekly coach summary
 * v0.39.9 - Coach 2.0 (Adaptive + Premium-ready)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, forbiddenError, successResponse } from '@/lib/api-handler';
import { generateCoachSummary, CoachType } from '@/lib/aure/assist/coachService';

/**
 * GET /api/aure/assist/coach/summary?type=snack|desk|outfit|room|generic
 * Get weekly coach summary (premium-only)
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

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as CoachType | null;

  if (!type) {
    return validationError('type parameter is required (snack|desk|outfit|room|generic)');
  }

  const validTypes: CoachType[] = ['snack', 'desk', 'outfit', 'room', 'generic'];
  if (!validTypes.includes(type)) {
    return validationError(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  try {
    const summary = await generateCoachSummary(user.id, type);

    // Check if premium required
    if ('error' in summary && summary.error === 'premium_required') {
      return forbiddenError('Coach is a premium feature. Upgrade to access personalized coaching.');
    }

    return successResponse({
      success: true,
      id: summary.id,
      coachType: summary.coachType,
      weekOf: summary.weekOf,
      summaryText: summary.summaryText,
      createdAt: summary.createdAt.toISOString(),
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get coach summary');
  }
});

