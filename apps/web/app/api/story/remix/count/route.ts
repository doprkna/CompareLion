/**
 * Story Remix Count API
 * Get remix count for a story
 * v0.40.14 - Story Remixes 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getRemixCount } from '@parel/story/storyRemixService';

/**
 * GET /api/story/remix/count?parentStoryId=XYZ
 * Get remix count for a story
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const parentStoryId = searchParams.get('parentStoryId');

  if (!parentStoryId) {
    return validationError('parentStoryId is required');
  }

  try {
    const count = await getRemixCount(parentStoryId);

    return successResponse({
      success: true,
      count,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch remix count');
  }
});

