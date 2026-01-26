/**
 * Moderation Action API
 * Approve or hide flagged entries
 * v0.38.12 - Power User Moderation View
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse } from '@/lib/api-handler';
import { moderateEntry, ModerationAction } from '@/lib/challenge/photo/moderationService';
import { z } from 'zod';

/**
 * Require power user (ADMIN or MODERATOR role)
 */
async function requirePowerUser(): Promise<string> {
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

  // Power user = ADMIN or MODERATOR role
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Power user access required');
  }

  return user.id;
}

const ModerationActionSchema = z.object({
  entryId: z.string().min(1, 'Entry ID is required'),
  action: z.enum(['approve', 'hide'], {
    errorMap: () => ({ message: 'Action must be "approve" or "hide"' }),
  }),
});

/**
 * POST /api/moderation/action
 * Moderate an entry (approve or hide)
 * Body: { entryId, action: "approve" | "hide" }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  try {
    await requirePowerUser();
  } catch (error: any) {
    if (error.message === 'Authentication required' || error.message === 'User not found') {
      return unauthorizedError(error.message);
    }
    if (error.message === 'Power user access required') {
      return forbiddenError('Power user access required');
    }
    throw error;
  }

  // Parse and validate request
  const body = await req.json();
  const validation = ModerationActionSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid moderation action request'
    );
  }

  const { entryId, action } = validation.data;

  try {
    const result = await moderateEntry(entryId, action as ModerationAction);

    return successResponse({
      success: result.success,
      message: result.message,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to moderate entry');
  }
});

