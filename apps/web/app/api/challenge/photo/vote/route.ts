/**
 * Photo Challenge Vote API
 * Vote on a photo entry
 * v0.37.12 - Photo Challenge
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { voteOnEntry } from '@/lib/challenge/photo/photoService';
import { VoteEntrySchema } from '@/lib/challenge/photo/schemas';

/**
 * POST /api/challenge/photo/vote
 * Vote on a photo entry
 * Body: { entryId, voteType }
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
  const validation = VoteEntrySchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid vote request'
    );
  }

  const { entryId, voteType } = validation.data;

  try {
    const result = await voteOnEntry(user.id, entryId, voteType);

    if (!result.success) {
      return validationError(result.error || 'Failed to vote');
    }

    return successResponse({
      success: true,
      appealScore: result.appealScore,
      creativityScore: result.creativityScore,
      userVotes: result.userVotes,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to vote');
  }
});

