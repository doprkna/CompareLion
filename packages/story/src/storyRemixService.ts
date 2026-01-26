/**
 * Story Remix Service
 * Handle story remixes and extensions
 * v0.40.14 - Story Remixes 1.0 (Remix & Extend Existing Stories)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';
import { generateStoryPanels, generateExtendedStory, StoryMode } from './storyService';
import { createNotification } from '@parel/notifications';

export type RemixType = 'extend' | 'response' | 'alt';

export interface RemixMetadata {
  parentStoryId: string;
  parentAuthor: {
    id: string;
    name: string | null;
    username: string | null;
  };
  remixType: RemixType;
}

/**
 * Get story panels for remix source
 */
export async function getStoryPanels(storyId: string): Promise<{
  panels: Array<{
    imageUrl: string;
    caption: string;
    vibeTag: string;
    microStory: string;
    role?: string | null;
  }>;
  author: {
    id: string;
    name: string | null;
    username: string | null;
  };
  panelCount: number;
  createdAt: Date;
}> {
  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      select: {
        id: true,
        panelCount: true,
        panelMetadata: true,
        createdAt: true,
        user: true,
      },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Extract panels from metadata
    const panels = Array.isArray(story.panelMetadata) ? story.panelMetadata : [];

    return {
      panels: panels.map((panel: any) => ({
        imageUrl: panel.imageUrl || '',
        caption: panel.caption || '',
        vibeTag: panel.vibeTag || '',
        microStory: panel.microStory || '',
        role: panel.role || null,
      })),
      author: {
        id: story.user.id,
        name: story.user.name,
        username: story.user.username,
      },
      panelCount: story.panelCount,
      createdAt: story.createdAt,
    };
  } catch (error) {
    logger.error('[StoryRemix] Failed to get story panels', { error, storyId });
    throw error;
  }
}

/**
 * Get remix chain depth
 */
async function getRemixChainDepth(storyId: string): Promise<number> {
  let depth = 0;
  let currentStoryId: string | null = storyId;
  const visited = new Set<string>();

  while (currentStoryId && depth < 10) {
    // Prevent infinite loops
    if (visited.has(currentStoryId)) {
      break;
    }
    visited.add(currentStoryId);

    const story = await prisma.story.findUnique({
      where: { id: currentStoryId },
      select: { parentStoryId: true },
    });

    if (!story || !story.parentStoryId) {
      break;
    }

    depth++;
    currentStoryId = story.parentStoryId;
  }

  return depth;
}

/**
 * Create remix story
 */
export async function createRemixStory(
  userId: string,
  parentStoryId: string,
  newPanelImages: string[],
  newPanelTexts?: (string | null)[]
): Promise<{
  storyId: string;
  status: string;
}> {
  try {
    // Validate parent story exists and is public
    const parentStory = await prisma.story.findUnique({
      where: { id: parentStoryId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      select: {
        id: true,
        userId: true,
        status: true,
        visibility: true,
        panelCount: true,
        panelMetadata: true,
        type: true,
      },
    });

    if (!parentStory) {
      throw new Error('Parent story not found');
    }

    // Only public stories can be remixed
    if (parentStory.visibility !== 'public') {
      throw new Error('Only public stories can be remixed');
    }

    // Story must be published
    if (parentStory.status !== 'published') {
      throw new Error('Only published stories can be remixed');
    }

    // Cannot remix own story
    if (parentStory.userId === userId) {
      throw new Error('Cannot remix your own story');
    }

    // Check remix chain depth
    const depth = await getRemixChainDepth(parentStoryId);
    if (depth >= 3) {
      throw new Error('Remix chain depth limit reached (max 3)');
    }

    // Validate new panels (1-3)
    if (newPanelImages.length < 1 || newPanelImages.length > 3) {
      throw new Error('Remix must add 1-3 new panels');
    }

    // Get parent story panels
    const parentPanels = Array.isArray(parentStory.panelMetadata)
      ? parentStory.panelMetadata
      : [];

    // Combine panels: original + new
    const combinedPanelImages = [
      ...parentPanels.map((p: any) => p.imageUrl),
      ...newPanelImages,
    ];

    const normalizedNewTexts = newPanelTexts || [];
    while (normalizedNewTexts.length < newPanelImages.length) {
      normalizedNewTexts.push(null);
    }

    const combinedPanelTexts = [
      ...parentPanels.map((p: any) => p.text || null),
      ...normalizedNewTexts,
    ];

    // Determine remix type based on number of new panels
    const remixType: RemixType =
      newPanelImages.length === 1 ? 'response' : newPanelImages.length >= 2 ? 'extend' : 'alt';

    // Generate story (use extended story generator for remixes)
    const totalPanels = combinedPanelImages.length;
    const story =
      totalPanels <= 3
        ? await generateStoryPanels(
            combinedPanelImages,
            combinedPanelTexts,
            totalPanels === 1 ? '1panel' : '3panel'
          )
        : await generateExtendedStory(combinedPanelImages, combinedPanelTexts);

    // Create remix story
    const coverImageUrl = story.panels[0]?.imageUrl || null;
    const panelMetadata = story.panels.map((panel) => ({
      imageUrl: panel.imageUrl,
      text: panel.text,
      caption: panel.caption,
      vibeTag: panel.vibeTag,
      microStory: panel.microStory,
      category: panel.category,
      role: (panel as any).role || null,
    }));

    const exportId = `story-remix-${userId}-${Date.now()}`;
    const remixStory = await prisma.story.create({
      data: {
        userId,
        type: totalPanels <= 3 ? 'simple' : 'extended',
        panelCount: story.panels.length,
        coverImageUrl,
        exportId,
        status: 'draft', // Default to draft (follow draft flow)
        visibility: 'private',
        publishedAt: null,
        parentStoryId, // Link to parent
        remixType, // Store remix type
        panelMetadata: panelMetadata as any,
      },
    });

    // Notify parent story owner (v0.40.17)
    try {
      if (parentStory.userId !== userId) {
        await createNotification(parentStory.userId, 'story_remix', {
          storyId: parentStoryId,
          remixId: remixStory.id,
        });
      }
    } catch (error) {
      logger.error('[StoryRemix] Failed to create remix notification', {
        error,
        parentStoryId,
        remixId: remixStory.id,
      });
    }

    return {
      storyId: remixStory.id,
      status: remixStory.status,
    };
  } catch (error) {
    logger.error('[StoryRemix] Failed to create remix story', {
      error,
      userId,
      parentStoryId,
    });
    throw error;
  }
}

/**
 * Get remix metadata
 */
export async function getRemixMetadata(storyId: string): Promise<RemixMetadata | null> {
  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        parentStory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
      select: {
        parentStoryId: true,
        remixType: true,
        parentStory: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!story || !story.parentStoryId || !story.parentStory) {
      return null;
    }

    return {
      parentStoryId: story.parentStoryId,
      parentAuthor: {
        id: story.parentStory.user.id,
        name: story.parentStory.user.name,
        username: story.parentStory.user.username,
      },
      remixType: (story.remixType as RemixType) || 'extend',
    };
  } catch (error) {
    logger.error('[StoryRemix] Failed to get remix metadata', { error, storyId });
    return null;
  }
}

/**
 * Get remix count for a story
 */
export async function getRemixCount(parentStoryId: string): Promise<number> {
  try {
    const count = await prisma.story.count({
      where: {
        parentStoryId,
        status: 'published', // Only count published remixes
      },
    });

    return count;
  } catch (error) {
    logger.error('[StoryRemix] Failed to get remix count', { error, parentStoryId });
    return 0;
  }
}

