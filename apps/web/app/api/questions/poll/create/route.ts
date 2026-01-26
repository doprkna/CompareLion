/**
 * Create Poll API
 * POST /api/questions/poll/create - Create poll options for a question
 * v0.37.4 - Poll Option Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { createPoll } from '@/lib/questions/poll/pollService';
import { CreatePollSchema } from '@/lib/questions/poll/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/questions/poll/create
 * Create poll options for a question
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Only admins or question authors can create polls
  // TODO: Add author check if needed
  if (user.role !== 'ADMIN') {
    return unauthorizedError('Admin access required');
  }

  const body = await parseBody(req);
  const validation = CreatePollSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { questionId, options } = validation.data;

  const result = await createPoll(questionId, options);

  if (!result.success) {
    return validationError(result.error || 'Failed to create poll');
  }

  return successResponse({
    success: true,
    message: 'Poll created successfully',
  });
});

