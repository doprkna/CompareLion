/**
 * Complete Session Item API
 * Mark a session item as rated or skipped
 * v0.38.17 - Batch Rating Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { completeRatingForItem } from '@/lib/rating/sessionService';
import { CompleteItemSchema } from '@/lib/rating/sessionSchemas';

/**
 * POST /api/rating/session/complete-item
 * Complete rating for a session item
 * Body: { sessionItemId, requestId?, skipped? }
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

  // Parse and validate request
  const body = await req.json();
  const validation = CompleteItemSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid complete item request'
    );
  }

  const { sessionItemId, requestId, skipped } = validation.data;

  try {
    const result = await completeRatingForItem(
      sessionItemId,
      user.id,
      requestId || null,
      skipped || false
    );

    return successResponse({
      success: result.success,
      sessionId: result.sessionId,
      totalItemsRated: result.totalItemsRated,
      totalItemsPlanned: result.totalItemsPlanned,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to complete item');
  }
});

