/**
 * Create Story Remix API
 * Create remix story from existing story
 * v0.40.14 - Story Remixes 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createRemixStory } from '@parel/story/storyRemixService';

/**
 * POST /api/story/remix/create
 * Create remix story
 * Body: { parentStoryId, newPanelImages, newPanelTexts? }
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
  const { parentStoryId, newPanelImages, newPanelTexts } = body;

  if (!parentStoryId || typeof parentStoryId !== 'string') {
    return validationError('parentStoryId is required');
  }

  if (!Array.isArray(newPanelImages) || newPanelImages.length === 0) {
    return validationError('newPanelImages must be a non-empty array');
  }

  if (newPanelImages.length > 3) {
    return validationError('Maximum 3 new panels allowed');
  }

  try {
    const result = await createRemixStory(user.id, parentStoryId, newPanelImages, newPanelTexts);

    return successResponse({
      success: true,
      storyId: result.storyId,
      status: result.status,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create remix');
  }
});

