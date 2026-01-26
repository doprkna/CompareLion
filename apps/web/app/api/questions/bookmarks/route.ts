/**
 * Question Bookmarks API
 * GET /api/questions/bookmarks - List current user's bookmarked questions
 * v0.37.1 - Bookmark Question Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getBookmarks } from '@/lib/bookmarks/bookmarkService';

export const runtime = 'nodejs';

/**
 * GET /api/questions/bookmarks
 * Returns all bookmarked questions for the current user
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

  const bookmarks = await getBookmarks(user.id);

  return successResponse({
    bookmarks: bookmarks.map(bookmark => ({
      id: bookmark.id,
      questionId: bookmark.questionId,
      createdAt: bookmark.createdAt.toISOString(),
      question: {
        id: bookmark.question.id,
        text: bookmark.question.text,
        category: bookmark.question.category,
      },
    })),
    totalBookmarks: bookmarks.length,
  });
});

