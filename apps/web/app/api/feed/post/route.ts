/**
 * Feed Post API - ComparePost Creation
 * POST /api/feed/post - Create a manual compare post
 * v0.36.31 - Social Compare Feed 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const CreatePostSchema = z.object({
  questionId: z.string().optional(),
  content: z.string().max(280, 'Content must be 280 characters or less').optional(),
  value: z.union([z.number(), z.string(), z.object({}).passthrough()]).optional(),
  visibility: z.enum(['public', 'friends', 'private']).optional().default('public'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const parsed = CreatePostSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid post data', parsed.error.issues);
  }

  const { questionId, content, value, visibility } = parsed.data;

  // Validate: must have at least content or value
  if (!content && !value && !questionId) {
    return validationError('Post must have content, value, or questionId');
  }

  // Rate limiting: Check if user posted recently (1 per 5 seconds)
  const recentPost = await prisma.comparePost.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gte: new Date(Date.now() - 5000), // 5 seconds ago
      },
    },
  });

  if (recentPost) {
    return validationError('Please wait before posting again');
  }

  // Create compare post
  const post = await prisma.comparePost.create({
    data: {
      userId: user.id,
      questionId: questionId || null,
      content: content || null,
      value: value ? (typeof value === 'object' ? value : { value }) : null,
      visibility: visibility || 'public',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          level: true,
        },
      },
    },
  });

  logger.debug(`[CompareFeed] Created post ${post.id} for user ${user.id}`);

  return successResponse({
    success: true,
    post: {
      id: post.id,
      userId: post.userId,
      questionId: post.questionId,
      content: post.content,
      value: post.value,
      createdAt: post.createdAt,
      user: {
        id: post.user.id,
        username: post.user.username,
        name: post.user.name,
        avatarUrl: post.user.avatarUrl,
        level: post.user.level,
      },
    },
  });
});

