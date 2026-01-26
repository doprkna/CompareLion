/**
 * Approve Draft API
 * POST /api/drafts/approve - Approve a draft (power user)
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { approveDraft } from '@/lib/drafts/draftService';
import { ApproveDraftSchema } from '@/lib/drafts/schemas';

export const runtime = 'nodejs';

async function requirePowerUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Power user = ADMIN or MODERATOR role (adjust based on your role system)
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Power user access required');
  }

  return user.id;
}

/**
 * POST /api/drafts/approve
 * Approve a draft (power user only)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const reviewerId = await requirePowerUser();

  const body = await parseBody(req);
  const validation = ApproveDraftSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { draftId, comment } = validation.data;

  const result = await approveDraft(reviewerId, draftId, comment);

  if (!result.success) {
    return validationError(result.error || 'Failed to approve draft');
  }

  return successResponse({
    success: true,
    message: 'Draft approved successfully',
  });
});

