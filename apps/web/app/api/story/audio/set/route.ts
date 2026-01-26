/**
 * Set Story Audio API
 * Attach audio to story
 * v0.40.15 - Story Audio 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { attachAudioToStory, type AudioType } from '@parel/story/storyAudioService';

/**
 * POST /api/story/audio/set
 * Set audio for story
 * Body: { storyId, audioType, audioTagId?, audioUrl? }
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
  const { storyId, audioType, audioTagId, audioUrl } = body;

  if (!storyId || typeof storyId !== 'string') {
    return validationError('storyId is required');
  }

  const validAudioTypes: AudioType[] = ['ambience', 'tag', 'voice'];
  if (!audioType || !validAudioTypes.includes(audioType)) {
    return validationError('audioType must be "ambience", "tag", or "voice"');
  }

  try {
    const updated = await attachAudioToStory(user.id, storyId, {
      audioType,
      audioTagId: audioTagId || null,
      audioUrl: audioUrl || null,
    });

    return successResponse({
      success: true,
      story: {
        id: updated.id,
        audioType: updated.audioType,
        audioTagId: updated.audioTagId,
        audioUrl: updated.audioUrl,
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to set audio');
  }
});

