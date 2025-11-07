import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError } from '@/lib/api-handler';

/**
 * GET /api/comments/[targetId]
 * Get all comments for a specific target (reflection/comparison)
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { targetId: string } }
) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const { targetId } = params;
  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get('targetType') || 'user_reflection';

  // Fetch comments
  const comments = await prisma.comment.findMany({
    where: {
      targetType,
      targetId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          visibility: true,
        },
      },
    },
    take: 50, // Limit to 50 comments
  });

  // Filter comments based on user visibility
  const visibleComments = await Promise.all(
    comments.map(async (comment) => {
      // Always show own comments
      if (comment.userId === user.userId) {
        return comment;
      }

      // Check visibility
      if (comment.user.visibility === 'PRIVATE') {
        return null; // Hide from non-friends
      }

      if (comment.user.visibility === 'FRIENDS') {
        // Check friendship
        const areFriends = await prisma.friend.findFirst({
          where: {
            OR: [
              { userId: user.userId, friendId: comment.userId, status: 'accepted' },
              { userId: comment.userId, friendId: user.userId, status: 'accepted' },
            ],
          },
        });

        if (!areFriends) {
          return null; // Hide from non-friends
        }
      }

      return comment;
    })
  );

  // Filter out nulls and format
  const formattedComments = visibleComments
    .filter((c) => c !== null)
    .map((comment) => ({
      id: comment!.id,
      content: comment!.content,
      createdAt: comment!.createdAt,
      flagged: comment!.flagged,
      user: {
        id: comment!.user.id,
        username: comment!.user.username,
        name: comment!.user.name,
        avatarUrl: comment!.user.avatarUrl,
      },
      isOwnComment: comment!.userId === user.userId,
    }));

  return NextResponse.json({
    success: true,
    comments: formattedComments,
    count: formattedComments.length,
  });
});

