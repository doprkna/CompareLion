/**
 * Story Audio Service
 * Handle story audio attachments
 * v0.40.15 - Story Audio 1.0 (Sound Tags + Voice Lines)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';

export type AudioType = 'none' | 'ambience' | 'tag' | 'voice';

export interface AudioData {
  audioType: AudioType;
  audioTagId?: string | null;
  audioUrl?: string | null;
}

/**
 * Attach audio to story
 */
export async function attachAudioToStory(
  userId: string,
  storyId: string,
  audioData: AudioData
): Promise<{
  id: string;
  audioType: string | null;
  audioTagId: string | null;
  audioUrl: string | null;
}> {
  try {
    // Verify story exists and belongs to user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.userId !== userId) {
      throw new Error('Unauthorized: Story does not belong to user');
    }

    // Validate audio data
    if (audioData.audioType === 'none') {
      throw new Error('Cannot set audioType to "none" (use clearAudio instead)');
    }

    if (audioData.audioType === 'tag' || audioData.audioType === 'ambience') {
      if (!audioData.audioTagId) {
        throw new Error('audioTagId is required for tag/ambience audio type');
      }
    }

    if (audioData.audioType === 'voice') {
      if (!audioData.audioUrl) {
        throw new Error('audioUrl is required for voice audio type');
      }
    }

    // Update story with audio
    const updated = await prisma.story.update({
      where: { id: storyId },
      data: {
        audioType: audioData.audioType,
        audioTagId: audioData.audioTagId || null,
        audioUrl: audioData.audioUrl || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        audioType: true,
        audioTagId: true,
        audioUrl: true,
      },
    });

    return updated;
  } catch (error) {
    logger.error('[StoryAudio] Failed to attach audio to story', { error, userId, storyId, audioData });
    throw error;
  }
}

/**
 * Clear audio from story
 */
export async function clearStoryAudio(userId: string, storyId: string): Promise<void> {
  try {
    // Verify story exists and belongs to user
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { userId: true },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    if (story.userId !== userId) {
      throw new Error('Unauthorized: Story does not belong to user');
    }

    // Clear audio fields
    await prisma.story.update({
      where: { id: storyId },
      data: {
        audioType: 'none',
        audioTagId: null,
        audioUrl: null,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logger.error('[StoryAudio] Failed to clear story audio', { error, userId, storyId });
    throw error;
  }
}

/**
 * Get story audio info
 */
export async function getStoryAudio(storyId: string): Promise<AudioData | null> {
  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: {
        audioType: true,
        audioTagId: true,
        audioUrl: true,
      },
    });

    if (!story) {
      return null;
    }

    if (!story.audioType || story.audioType === 'none') {
      return null;
    }

    return {
      audioType: story.audioType as AudioType,
      audioTagId: story.audioTagId || null,
      audioUrl: story.audioUrl || null,
    };
  } catch (error) {
    logger.error('[StoryAudio] Failed to get story audio', { error, storyId });
    return null;
  }
}

