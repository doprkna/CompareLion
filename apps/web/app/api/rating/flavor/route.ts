/**
 * Rating Flavor API
 * Get AI-generated flavor text (compliment + roast) for a rating result
 * v0.38.4 - Roast / Compliment Generator
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { generateFlavorText } from '@/lib/rating/ratingService';

/**
 * GET /api/rating/flavor?requestId=XYZ
 * Get flavor text (compliment + roast) for a rating result
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
    const flavor = await generateFlavorText(requestId);

    return successResponse({
      success: true,
      requestId,
      compliment: flavor.compliment,
      roast: flavor.roast,
      neutral: flavor.neutral,
      cached: false, // TODO: Implement Redis caching in future
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate flavor text');
  }
});

