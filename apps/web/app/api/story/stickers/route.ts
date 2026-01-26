/**
 * Story Stickers API
 * Get sticker aggregates for a story
 * v0.40.6 - Story Reactions + Stickers 1.0
 */

import { NextRequest } from 'next/server';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { getStoryReactionSummary } from '@parel/story/storyFeedService';
import { prisma } from '@/lib/db';

/**
 * GET /api/story/stickers
 * Get sticker aggregates for a story
 * Query params: storyId (required)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get('storyId');

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId query parameter is required');
  }

  // Verify story exists
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { id: true },
  });

  if (!story) {
    return validationError('Story not found');
  }

  try {
    const summary = await getStoryReactionSummary(storyId);

    return successResponse({
      success: true,
      stickers: summary.stickers,
      reactions: summary.reactions,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch stickers');
  }
});

