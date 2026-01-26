/**
 * Photo Challenge Scam Flag API
 * Flag a photo entry as scam
 * v0.38.6 - Image Integrity Check + Scam Alert
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { flagScam } from '@/lib/challenge/photo/scamFlagService';
import { ScamFlagSchema } from '@/lib/challenge/photo/schemas';

/**
 * POST /api/challenge/photo/scam-flag
 * Flag a photo entry as scam
 * Body: { entryId, reason }
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
  const validation = ScamFlagSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid scam flag request'
    );
  }

  const { entryId, reason } = validation.data;

  try {
    const result = await flagScam(user.id, entryId, reason);

    return successResponse({
      success: true,
      message: result.message,
      flagCount: result.flagCount,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to flag entry');
  }
});

