/**
 * Rating Comparison API
 * Get comparison data for a rating result
 * v0.38.3 - Cross-Category Comparison View
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getComparisonData } from '@/lib/rating/ratingService';

/**
 * GET /api/rating/comparison?requestId=XYZ
 * Get comparison data for a rating result
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const { searchParams } = new URL(req.url);
  const requestId = searchParams.get('requestId');

  if (!requestId) {
    return validationError('requestId is required');
  }

  try {
    const comparison = await getComparisonData(requestId);

    return successResponse({
      success: true,
      requestId,
      userScore: comparison.userScore,
      avgScore: comparison.avgScore,
      percentiles: comparison.percentiles,
      topEntries: comparison.topEntries,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get comparison data');
  }
});

