/**
 * Story Remix Source API
 * Get original story panels for remix
 * v0.40.14 - Story Remixes 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getStoryPanels } from '@parel/story/storyRemixService';

/**
 * GET /api/story/remix/source?storyId=XYZ
 * Get original story panels for remix
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get('storyId');

  if (!storyId) {
    return validationError('storyId is required');
  }

  try {
    const source = await getStoryPanels(storyId);

    return successResponse({
      success: true,
      panels: source.panels,
      author: source.author,
      panelCount: source.panelCount,
      createdAt: source.createdAt,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch remix source');
  }
});

