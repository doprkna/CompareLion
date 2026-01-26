/**
 * Question Bookmark API
 * POST /api/questions/bookmark - Add a bookmark
 * DELETE /api/questions/bookmark - Remove a bookmark
 * v0.37.1 - Bookmark Question Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { addBookmark, removeBookmark } from '@/lib/bookmarks/bookmarkService';
import { AddBookmarkSchema, RemoveBookmarkSchema } from '@/lib/bookmarks/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/questions/bookmark
 * Add a bookmark for a question
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

  const body = await parseBody(req);
  const validation = AddBookmarkSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { questionId } = validation.data;

  const result = await addBookmark(user.id, questionId);

  if (!result.success) {
    return validationError(result.error || 'Failed to add bookmark');
  }

  return successResponse({
    success: true,
    message: 'Question bookmarked successfully',
  });
});

/**
 * DELETE /api/questions/bookmark
 * Remove a bookmark for a question
 */
export const DELETE = safeAsync(async (req: NextRequest) => {
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

  const body = await parseBody(req);
  const validation = RemoveBookmarkSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { questionId } = validation.data;

  const result = await removeBookmark(user.id, questionId);

  if (!result.success) {
    return validationError(result.error || 'Failed to remove bookmark');
  }

  return successResponse({
    success: true,
    message: 'Bookmark removed successfully',
  });
});

