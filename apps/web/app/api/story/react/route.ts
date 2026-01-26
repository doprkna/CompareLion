/**
 * Story Reaction API
 * Add or remove story reaction (supports stickers)
 * v0.40.6 - Story Reactions + Stickers 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { handleStoryReaction } from '@parel/story/storyFeedService';
import { parseStickerType, getAllStickers } from '@parel/story/stickers';

/**
 * POST /api/story/react
 * Toggle story reaction or add sticker
 * Body: { storyId: string, type: "like" | "lol" | "vibe" | "sticker:<id>", action: "toggle" | "add" }
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
  const { storyId, type, action } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  if (!type || typeof type !== 'string') {
    return validationError('type is required');
  }

  const stickerId = parseStickerType(type);
  const isSticker = stickerId !== null;

  if (isSticker) {
    // Validate sticker exists
    const stickers = getAllStickers();
    if (!stickers.find((s) => s.id === stickerId)) {
      return validationError(`Invalid sticker ID: ${stickerId}`);
    }
    // Stickers always use "add" action
    if (action && action !== 'add') {
      return validationError('Sticker reactions must use action "add"');
    }
  } else {
    // Standard reaction validation
    const validTypes = ['like', 'lol', 'vibe'];
    if (!validTypes.includes(type)) {
      return validationError('type must be "like", "lol", "vibe", or "sticker:<id>"');
    }
    if (action && action !== 'toggle') {
      return validationError('Standard reactions must use action "toggle"');
    }
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
    const finalAction = isSticker ? 'add' : (action || 'toggle');
    const result = await handleStoryReaction(user.id, storyId, type, finalAction);

    return successResponse({
      success: true,
      reactions: result.reactions,
      stickers: result.stickers,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to handle reaction');
  }
});

