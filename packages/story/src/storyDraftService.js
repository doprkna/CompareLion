/**
 * Story Draft Service
 * Handle story drafts and publishing
 * v0.40.13 - Story Drafts 1.0
 */
import { prisma } from '@parel/db';
import { logger } from '@parel/core';
/**
 * Publish draft story
 */
export async function publishDraftStory(userId, storyId, visibility) {
    try {
        // Verify story exists and is draft
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: {
                id: true,
                userId: true,
                status: true,
            },
        });
        if (!story) {
            throw new Error('Story not found');
        }
        if (story.userId !== userId) {
            throw new Error('Unauthorized: Story does not belong to user');
        }
        if (story.status !== 'draft') {
            throw new Error('Story is not a draft');
        }
        // Publish story
        const updated = await prisma.story.update({
            where: { id: storyId },
            data: {
                status: 'published',
                visibility,
                publishedAt: new Date(),
                updatedAt: new Date(),
            },
            select: {
                id: true,
                status: true,
                visibility: true,
                publishedAt: true,
            },
        });
        return updated;
    }
    catch (error) {
        logger.error('[StoryDraft] Failed to publish draft story', { error, userId, storyId, visibility });
        throw error;
    }
}
/**
 * Update draft story metadata
 */
export async function updateDraftStoryMetadata(userId, storyId, data) {
    try {
        // Verify story exists and is draft
        const story = await prisma.story.findUnique({
            where: { id: storyId },
            select: {
                id: true,
                userId: true,
                status: true,
            },
        });
        if (!story) {
            throw new Error('Story not found');
        }
        if (story.userId !== userId) {
            throw new Error('Unauthorized: Story does not belong to user');
        }
        if (story.status !== 'draft') {
            throw new Error('Story is not a draft');
        }
        // Update metadata
        const updateData = {
            updatedAt: new Date(),
        };
        if (data.title !== undefined) {
            updateData.title = data.title;
        }
        const updated = await prisma.story.update({
            where: { id: storyId },
            data: updateData,
            select: {
                id: true,
                title: true,
            },
        });
        return updated;
    }
    catch (error) {
        logger.error('[StoryDraft] Failed to update draft story metadata', { error, userId, storyId, data });
        throw error;
    }
}
/**
 * Get user's draft stories
 */
export async function getUserDraftStories(userId) {
    try {
        const drafts = await prisma.story.findMany({
            where: {
                userId,
                status: 'draft',
            },
            select: {
                id: true,
                type: true,
                title: true,
                coverImageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return drafts;
    }
    catch (error) {
        logger.error('[StoryDraft] Failed to get user draft stories', { error, userId });
        throw error;
    }
}
