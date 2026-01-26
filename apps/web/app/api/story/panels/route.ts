/**
 * Story Panels API
 * Get story panels for viewer
 * v0.40.11 - Story Viewer 2.0 (Swipe / Carousel Mode)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/story/panels?storyId=XYZ
 * Get story panels for viewer
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const storyId = searchParams.get('storyId');

  if (!storyId) {
    return validationError('storyId is required');
  }

  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        title: true,
        type: true,
        panelCount: true,
        panelMetadata: true,
        createdAt: true,
        audioType: true,
        audioTagId: true,
        audioUrl: true,
        userId: true, // v0.40.17 - For ownership check
      },
    });

    if (!story) {
      return validationError('Story not found');
    }

    // Check if panel metadata exists
    if (story.panelMetadata && typeof story.panelMetadata === 'object') {
      const panels = Array.isArray(story.panelMetadata)
        ? story.panelMetadata
        : [];

      return successResponse({
        success: true,
        panels: panels.map((panel: any) => ({
          imageUrl: panel.imageUrl || '',
          caption: panel.caption || '',
          vibeTag: panel.vibeTag || '',
          microStory: panel.microStory || '',
          role: panel.role || null,
        })),
        title: story.title,
        type: story.type,
        createdAt: story.createdAt,
        userId: story.userId, // v0.40.17 - For ownership check
        audio: story.audioType && story.audioType !== 'none'
          ? {
              audioType: story.audioType,
              audioTagId: story.audioTagId,
              audioUrl: story.audioUrl,
            }
          : null,
      });
    }

    // Fallback: no panel metadata (old stories)
    return successResponse({
      success: true,
      panels: [],
      title: story.title,
      type: story.type,
      createdAt: story.createdAt,
      fallback: true, // Indicates PNG viewer should be used
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to fetch story panels');
  }
});

