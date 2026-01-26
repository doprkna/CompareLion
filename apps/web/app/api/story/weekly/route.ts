/**
 * Parel Story Generator - Weekly Story API
 * Generate weekly recap story from user activity
 * v0.40.3 - Auto-Story from Weekly Activity (My Week Story)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getWeeklyActivity, generateWeeklyStory } from '@parel/story/weeklyStoryService';
import { createNotification } from '@/lib/notifications/notificationService';

/**
 * GET /api/story/weekly
 * Generate weekly recap story (last 7 days)
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  try {
    // Get weekly activity
    const activity = await getWeeklyActivity(user.id);

    // Generate story
    const story = await generateWeeklyStory(activity);

    // Generate export ID
    const exportId = `story-weekly-${user.id}-${Date.now()}`;

    // Persist story to database (only if generation succeeded, private by default)
    let storyId: string | null = null;
    if (story.panels.length > 0) {
      const coverImageUrl = story.panels[0]?.imageUrl || null;
      const panelMetadata = story.panels.map((panel) => ({
        imageUrl: panel.imageUrl,
        caption: panel.caption,
        vibeTag: panel.vibeTag,
        microStory: panel.microStory,
        role: panel.role,
      }));
      const persistedStory = await prisma.story.create({
        data: {
          userId: user.id,
          title: story.title || null,
          type: 'weekly',
          panelCount: story.panels.length,
          coverImageUrl,
          exportId,
          status: 'draft', // Default to draft (v0.40.13)
          visibility: 'private', // Default to private, requires explicit publishing
          publishedAt: null, // Not published yet
          panelMetadata: panelMetadata as any, // Store panel metadata as JSON
        },
      });
      storyId = persistedStory.id;

      // Notify user that weekly story is ready (v0.40.17)
      try {
        await createNotification(user.id, 'weekly_story_ready', {
          storyId,
        });
      } catch (error) {
        console.error('Failed to create weekly story notification', error);
      }
    }

    return successResponse({
      success: true,
      story: {
        title: story.title,
        panels: story.panels.map((panel) => ({
          role: panel.role,
          imageUrl: panel.imageUrl,
          caption: panel.caption,
          vibeTag: panel.vibeTag,
          microStory: panel.microStory,
        })),
        outro: story.outro,
      },
      exportId,
      storyId,
    });
  } catch (error: any) {
    return successResponse({
      success: false,
      error: error.message || 'Failed to generate weekly story',
      story: {
        title: 'My Week in Vibes',
        panels: [],
        outro: 'Check back next week for your recap!',
      },
      exportId: null,
      storyId: null,
    });
  }
});

