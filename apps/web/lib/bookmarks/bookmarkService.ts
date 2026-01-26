/**
 * Bookmark Service
 * Add, remove, and retrieve question bookmarks
 * v0.37.1 - Bookmark Question Feature
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Add a bookmark for a question
 * 
 * @param userId - User ID
 * @param questionId - Question ID to bookmark
 * @returns Success result
 */
export async function addBookmark(
  userId: string,
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      return { success: false, error: 'Question not found' };
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Question already bookmarked' };
    }

    // Create bookmark
    await prisma.bookmark.create({
      data: {
        userId,
        questionId,
      },
    });

    logger.debug(`[BookmarkService] User ${userId} bookmarked question ${questionId}`);

    return { success: true };
  } catch (error) {
    logger.error('[BookmarkService] Failed to add bookmark', { userId, questionId, error });
    return { success: false, error: 'Failed to add bookmark' };
  }
}

/**
 * Remove a bookmark for a question
 * 
 * @param userId - User ID
 * @param questionId - Question ID to unbookmark
 * @returns Success result
 */
export async function removeBookmark(
  userId: string,
  questionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (!bookmark) {
      return { success: false, error: 'Bookmark not found' };
    }

    await prisma.bookmark.delete({
      where: { id: bookmark.id },
    });

    logger.debug(`[BookmarkService] User ${userId} removed bookmark for question ${questionId}`);

    return { success: true };
  } catch (error) {
    logger.error('[BookmarkService] Failed to remove bookmark', { userId, questionId, error });
    return { success: false, error: 'Failed to remove bookmark' };
  }
}

/**
 * Get all bookmarks for a user
 * 
 * @param userId - User ID
 * @returns Array of bookmarks with question details
 */
export async function getBookmarks(userId: string) {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            text: true,
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookmarks.map(bookmark => ({
      id: bookmark.id,
      userId: bookmark.userId,
      questionId: bookmark.questionId,
      createdAt: bookmark.createdAt,
      question: {
        id: bookmark.question.id,
        text: bookmark.question.text,
        category: bookmark.question.category,
      },
    }));
  } catch (error) {
    logger.error('[BookmarkService] Failed to get bookmarks', { userId, error });
    return [];
  }
}

/**
 * Check if a question is bookmarked by a user
 * 
 * @param userId - User ID
 * @param questionId - Question ID
 * @returns True if bookmarked
 */
export async function isBookmarked(userId: string, questionId: string): Promise<boolean> {
  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    return !!bookmark;
  } catch (error) {
    logger.error('[BookmarkService] Failed to check bookmark status', { userId, questionId, error });
    return false;
  }
}

