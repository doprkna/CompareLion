/**
 * AURE Assist Engine - AI Coach API
 * Get personalized coaching advice (premium-only)
 * v0.39.3 - AURE Assist Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, forbiddenError, successResponse } from '@/lib/api-handler';
import { generateCoachAdvice, CoachType } from '@/lib/aure/assist/coachService';

/**
 * GET /api/aure/assist/coach?type=snack|desk|outfit|room|generic
 * Get coach advice (premium-only)
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
    const advice = await generateCoachAdvice(user.id, type);

    // Check if premium required
    if ('error' in advice && advice.error === 'premium_required') {
      return forbiddenError('Coach is a premium feature. Upgrade to access personalized coaching.');
    }

    return successResponse({
      success: true,
      tips: advice.tips,
      summary: advice.summary,
      focusAreas: advice.focusAreas,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate coach advice');
  }
});


