/**
 * Feed Status API
 * POST /api/feed/status - Post a user-generated status update
 * v0.36.25 - Community Feed 1.0
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
import { postStatusUpdate } from '@/lib/services/feedService';

const StatusSchema = z.object({
  content: z.string().min(1).max(160),
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
  const parsed = StatusSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid status data', parsed.error.issues);
  }

  const { content } = parsed.data;

  // Create feed post
  const postId = await postStatusUpdate(user.id, content);

  // Also update user's statusMessage if not set
  await prisma.user.update({
    where: { id: user.id },
    data: {
      statusMessage: content,
    },
  });

  return successResponse({
    success: true,
    postId,
    message: 'Status posted',
  });
});

