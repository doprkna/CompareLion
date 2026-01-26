/**
 * Request Review API
 * POST /api/drafts/request-review - Request review for a draft
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { requestReview } from '@/lib/drafts/draftService';
import { RequestReviewSchema } from '@/lib/drafts/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/drafts/request-review
 * Request review for a draft (changes status to pending)
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
  const validation = RequestReviewSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { draftId } = validation.data;

  const result = await requestReview(user.id, draftId);

  if (!result.success) {
    return validationError(result.error || 'Failed to request review');
  }

  return successResponse({
    success: true,
    message: 'Review requested successfully',
  });
});

