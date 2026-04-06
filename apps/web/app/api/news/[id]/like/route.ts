/**
 * POST /api/news/[id]/like - Toggle like (auth required)
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError, notFoundError } from '@/lib/api-handler';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return unauthorizedError();

  const { id: postId } = await params;
  const post = await prisma.newsPost.findFirst({
    where: { id: postId, status: 'PUBLISHED' },
  });
  if (!post) return notFoundError();

  const existing = await prisma.newsReaction.findUnique({
    where: { userId_postId_type: { userId: user.id, postId, type: 'LIKE' } },
  });

  if (existing) {
    await prisma.newsReaction.delete({
      where: { id: existing.id },
    });
    const count = await prisma.newsReaction.count({ where: { postId, type: 'LIKE' } });
    return successResponse({ liked: false, likeCount: count });
  } else {
    await prisma.newsReaction.create({
      data: { userId: user.id, postId, type: 'LIKE' },
    });
    const count = await prisma.newsReaction.count({ where: { postId, type: 'LIKE' } });
    return successResponse({ liked: true, likeCount: count });
  }
}
