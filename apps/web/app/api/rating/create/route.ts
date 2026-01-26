/**
 * Rating Create API
 * Create a new rating request
 * v0.38.1 - AI Universal Rating Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createRatingRequest } from '@/lib/rating/ratingService';
import { CreateRatingRequestSchema } from '@/lib/rating/schemas';

/**
 * POST /api/rating/create
 * Create a new rating request
 * Body: { category, imageUrl?, text? }
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
  const validation = CreateRatingRequestSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid rating request'
    );
  }

  const { category, imageUrl, text } = validation.data;

  try {
    const request = await createRatingRequest(user.id, category, imageUrl, text);

    return successResponse({
      success: true,
      requestId: request.id,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create rating request');
  }
});

