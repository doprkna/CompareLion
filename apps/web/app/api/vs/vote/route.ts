/**
 * VS Vote API
 * Vote on a VS comparison
 * v0.38.16 - VS Mode
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { voteOnVs } from '@/lib/rating/vsService';
import { VoteVsSchema } from '@/lib/rating/vsSchemas';

/**
 * POST /api/vs/vote
 * Vote on a VS comparison
 * Body: { vsId, choice: "left" | "right" }
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
  const validation = VoteVsSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid vote request'
    );
  }

  const { vsId, choice } = validation.data;

  try {
    const result = await voteOnVs(user.id, vsId, choice);

    // Record faction contribution for VS participation (fire-and-forget)
    import('@/lib/aure/interaction/battleService')
      .then(({ recordFactionContribution }) => {
        return recordFactionContribution(user.id, 'vs', 1);
      })
      .catch(() => {
        // Silently fail - faction battles are optional
      });

    return successResponse({
      success: result.success,
      choice: result.choice,
      voteCounts: result.voteCounts,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to vote');
  }
});

