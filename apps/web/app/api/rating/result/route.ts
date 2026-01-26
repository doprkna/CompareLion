/**
 * Rating Result API
 * Get rating result for a request
 * v0.38.1 - AI Universal Rating Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getRatingResult } from '@/lib/rating/ratingService';

/**
 * GET /api/rating/result?requestId=XYZ
 * Get rating result for a request (generates if not exists)
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
    const result = await getRatingResult(requestId);

    return successResponse({
      success: true,
      requestId,
      metrics: result.metrics,
      summaryText: result.summaryText,
      roastText: result.roastText,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to get rating result');
  }
});

