/**
 * Parel Story Generator API 1.0
 * Create story from panels
 * v0.40.1 - Parel Story Generator 1.0 (Creative AI Layer)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { generateStoryPanels, StoryMode } from '@parel/story/storyService';

/**
 * POST /api/story/create
 * Create story from panels
 * Body: { panelImages: string[], panelTexts?: (string | null)[], mode: "1panel" | "3panel" }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const { panelImages, panelTexts, mode } = body;

  if (!Array.isArray(panelImages) || panelImages.length === 0) {
    return validationError('panelImages must be a non-empty array');
  }

  if (panelImages.length > 3) {
    return validationError('Maximum 3 panels allowed');
  }

  const validModes: StoryMode[] = ['1panel', '3panel'];
  if (!mode || !validModes.includes(mode)) {
    return validationError('mode must be "1panel" or "3panel"');
  }

  // Validate panel count matches mode
  if (mode === '1panel' && panelImages.length !== 1) {
    return validationError('1panel mode requires exactly 1 panel image');
  }
  if (mode === '3panel' && panelImages.length !== 3) {
    return validationError('3panel mode requires exactly 3 panel images');
  }

  // Normalize panelTexts (ensure same length as panelImages)
  const normalizedTexts: (string | null)[] = panelTexts || [];
  while (normalizedTexts.length < panelImages.length) {
    normalizedTexts.push(null);
  }

  try {
    const story = await generateStoryPanels(panelImages, normalizedTexts, mode);

    // Generate export ID (simple timestamp-based ID for now)
    const exportId = `story-${user.id}-${Date.now()}`;

    // Persist story to database (private by default, requires explicit publishing)
    const coverImageUrl = story.panels[0]?.imageUrl || null;
    const panelMetadata = story.panels.map((panel) => ({
      imageUrl: panel.imageUrl,
      text: panel.text,
      caption: panel.caption,
      vibeTag: panel.vibeTag,
      microStory: panel.microStory,
      category: panel.category,
    }));
    const persistedStory = await prisma.story.create({
      data: {
        userId: user.id,
        type: 'simple',
        panelCount: story.panels.length,
        coverImageUrl,
        exportId,
        status: 'draft', // Default to draft (v0.40.13)
        visibility: 'private', // Default to private, requires explicit publishing
        publishedAt: null, // Not published yet
        panelMetadata: panelMetadata as any, // Store panel metadata as JSON
      },
    });

    return successResponse({
      success: true,
      story: {
        panels: story.panels.map((panel) => ({
          imageUrl: panel.imageUrl,
          text: panel.text,
          caption: panel.caption,
          vibeTag: panel.vibeTag,
          microStory: panel.microStory,
          category: panel.category,
        })),
        throughline: story.throughline,
      },
      exportId,
      storyId: persistedStory.id,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate story');
  }
});

