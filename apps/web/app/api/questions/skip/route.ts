/**
 * Skip Question API
 * POST /api/questions/skip - Skip a question
 * v0.37.2 - Skip Question Feature
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { skipQuestion } from '@/lib/questions/skip/skipService';
import { SkipQuestionSchema } from '@/lib/questions/skip/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/questions/skip
 * Skip a question for the current user
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
  const validation = SkipQuestionSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { questionId } = validation.data;

  const result = await skipQuestion(user.id, questionId);

  if (!result.success) {
    return validationError(result.error || 'Failed to skip question');
  }

  return successResponse({
    status: 'ok',
    success: true,
    message: 'Question skipped successfully',
  });
});

