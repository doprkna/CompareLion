/**
 * Deep Dive Analysis API
 * Get premium deep dive analysis for rating
 * v0.38.13 - Premium Deep Dive Analysis
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse } from '@/lib/api-handler';
import { generateDeepDiveAnalysis } from '@/lib/rating/deepDiveService';
import { isPremiumUser } from '@/lib/rating/premiumCheck';

/**
 * GET /api/rating/deep-dive?requestId=XYZ
 * Get deep dive analysis (premium only)
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

  // Check premium status
  const isPremium = await isPremiumUser(user.id);
  if (!isPremium) {
    return forbiddenError('Premium subscription required');
  }

  // Get requestId from query params
  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return validationError('requestId is required');
  }

  try {
    // Verify request belongs to user
    const request = await prisma.ratingRequest.findUnique({
      where: { id: requestId },
      select: { userId: true },
    });

    if (!request) {
      return validationError('Rating request not found');
    }

    if (request.userId !== user.id) {
      return forbiddenError('Access denied');
    }

    // Generate deep dive analysis
    const analysis = await generateDeepDiveAnalysis(requestId);

    return successResponse({
      success: true,
      analysis,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate deep dive analysis');
  }
});

