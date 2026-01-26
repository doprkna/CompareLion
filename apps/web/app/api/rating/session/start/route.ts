/**
 * Start Rating Session API
 * Start a new batch rating session
 * v0.38.17 - Batch Rating Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { startRatingSession } from '@/lib/rating/sessionService';
import { StartSessionSchema } from '@/lib/rating/sessionSchemas';

/**
 * POST /api/rating/session/start
 * Start a new rating session
 * Body: { category, totalItems }
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
  const validation = StartSessionSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid session request'
    );
  }

  const { category, totalItems } = validation.data;

  try {
    const result = await startRatingSession(user.id, category, totalItems);

    return successResponse({
      success: true,
      sessionId: result.sessionId,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to start session');
  }
});

