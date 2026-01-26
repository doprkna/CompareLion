/**
 * Create Draft API
 * POST /api/drafts/create - Create a new draft
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { submitDraft } from '@/lib/drafts/draftService';
import { CreateDraftSchema } from '@/lib/drafts/schemas';

export const runtime = 'nodejs';

/**
 * POST /api/drafts/create
 * Create a new draft
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
  const validation = CreateDraftSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { content } = validation.data;

  const result = await submitDraft(user.id, content);

  if (!result.success) {
    return validationError(result.error || 'Failed to create draft');
  }

  return successResponse({
    success: true,
    draftId: result.draftId,
    message: 'Draft created successfully',
  });
});

