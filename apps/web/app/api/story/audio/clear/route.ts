/**
 * Clear Story Audio API
 * Remove audio from story
 * v0.40.15 - Story Audio 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { clearStoryAudio } from '@parel/story/storyAudioService';

/**
 * POST /api/story/audio/clear
 * Clear audio from story
 * Body: { storyId }
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
  const { storyId } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  try {
    await clearStoryAudio(user.id, storyId);

    return successResponse({
      success: true,
      message: 'Audio cleared successfully',
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to clear audio');
  }
});

