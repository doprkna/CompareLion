/**
 * Story Remix Metadata API
 * Get remix metadata for a story
 * v0.40.14 - Story Remixes 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getRemixMetadata } from '@parel/story/storyRemixService';

/**
 * GET /api/story/remix/metadata?storyId=XYZ
 * Get remix metadata for a story
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get('storyId');

  if (!storyId) {
    return validationError('storyId is required');
  }

  try {
    const metadata = await getRemixMetadata(storyId);

    return successResponse({
      success: true,
      metadata,
    });
  } catch (error: any) {
    return successResponse({
      success: true,
      metadata: null,
    });
  }
});

