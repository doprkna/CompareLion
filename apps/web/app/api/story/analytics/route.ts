/**
 * Story Analytics API
 * Get story analytics (views, reactions, stickers, reach score)
 * v0.40.12 - Story Analytics 1.0 (Views, Reactions, Engagement)
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getStoryAnalytics } from '@parel/story/storyAnalyticsService';

/**
 * GET /api/story/analytics?storyId=XYZ
 * Get story analytics
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get('storyId');

  if (!storyId) {
    return validationError('storyId is required');
  }

  try {
    const analytics = await getStoryAnalytics(storyId);

    return successResponse({
      success: true,
      viewCount: analytics.viewCount,
      reactions: analytics.reactions,
      stickers: analytics.stickers,
      reachScore: analytics.reachScore,
      inChallenges: analytics.inChallenges,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch analytics');
  }
});

