/**
 * Create VS Comparison API
 * Create a new VS comparison between two items
 * v0.38.16 - VS Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createVsComparison } from '@/lib/rating/vsService';
import { CreateVsRequestSchema } from '@/lib/rating/vsSchemas';

/**
 * POST /api/vs/create
 * Create a new VS comparison
 * Body: { leftImageUrl, rightImageUrl, category }
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
  const validation = CreateVsRequestSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid VS request'
    );
  }

  const { leftImageUrl, rightImageUrl, category } = validation.data;

  try {
    const result = await createVsComparison(
      user.id,
      leftImageUrl,
      rightImageUrl,
      category
    );

    return successResponse({
      success: true,
      vsId: result.vsId,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create VS comparison');
  }
});

