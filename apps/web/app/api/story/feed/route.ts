/**
 * Story Feed API
 * Get public stories feed
 * v0.40.5 - Story Feed 1.0 (Public Story Stream)
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getPublicStoriesFeed } from '@parel/story/storyFeedService';

/**
 * GET /api/story/feed
 * Get public stories feed
 * Query params: limit (default 20), cursor (ISO date string), sort (ranked|latest, default ranked)
 * v0.40.16 - Added ranking support
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get('limit');
  const cursor = searchParams.get('cursor');
  const sortParam = searchParams.get('sort');

  const limit = limitParam ? parseInt(limitParam, 10) : 20;
  if (isNaN(limit) || limit < 1 || limit > 100) {
    return validationError('limit must be between 1 and 100');
  }

  const sort = sortParam === 'latest' ? 'latest' : 'ranked'; // Default to ranked

  try {
    const result = await getPublicStoriesFeed({
      limit,
      cursor: cursor || undefined,
      sort,
    });

    return successResponse({
      success: true,
      stories: result.stories,
      nextCursor: result.nextCursor,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch story feed');
  }
});

