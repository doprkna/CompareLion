/**
 * Parel Story Generator - Extended Story API 2.0
 * Create extended story (4-8 panels) with narrative arc
 * v0.40.2 - Parel Stories 2.0 (Extended Stories)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { generateExtendedStory, LayoutMode } from '@parel/story/storyService';

/**
 * POST /api/story/create-extended
 * Create extended story (4-8 panels) with narrative arc
 * Body: { panelImages: string[], panelTexts?: (string | null)[], requestIds?: string[], layoutMode?: "vertical" | "grid" }
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
  const { panelImages, panelTexts, requestIds, layoutMode } = body;

  if (!Array.isArray(panelImages) || panelImages.length < 4 || panelImages.length > 8) {
    return validationError('panelImages must be an array with 4-8 items');
  }

  const validLayoutModes: LayoutMode[] = ['vertical', 'grid'];
  const finalLayoutMode: LayoutMode = layoutMode && validLayoutModes.includes(layoutMode) 
    ? layoutMode 
    : 'grid';

  // Normalize panelTexts
  const normalizedTexts: (string | null)[] = panelTexts || [];
  while (normalizedTexts.length < panelImages.length) {
    normalizedTexts.push(null);
  }

  try {
    const story = await generateExtendedStory(
      panelImages,
      normalizedTexts,
      requestIds || undefined
    );

    // Generate export ID
    const exportId = `story-extended-${user.id}-${Date.now()}`;

    // Persist story to database (private by default, requires explicit publishing)
    const coverImageUrl = story.panels[0]?.imageUrl || null;
    const panelMetadata = story.panels.map((panel) => ({
      imageUrl: panel.imageUrl,
      text: panel.text,
      caption: panel.caption,
      vibeTag: panel.vibeTag,
      microStory: panel.microStory,
      category: panel.category,
      role: panel.role,
    }));
    const persistedStory = await prisma.story.create({
      data: {
        userId: user.id,
        title: story.title || null,
        type: 'extended',
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
        title: story.title,
        logline: story.logline,
        panels: story.panels.map((panel) => ({
          role: panel.role,
          imageUrl: panel.imageUrl,
          text: panel.text,
          caption: panel.caption,
          vibeTag: panel.vibeTag,
          microStory: panel.microStory,
          category: panel.category,
        })),
      },
      exportId,
      layoutMode: finalLayoutMode,
      storyId: persistedStory.id,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to generate extended story');
  }
});

