/**
 * My Drafts API
 * GET /api/drafts/my - List current user's drafts
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

/**
 * GET /api/drafts/my
 * List current user's drafts
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const drafts = await prisma.draft.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          boosts: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return successResponse({
    drafts: drafts.map(draft => ({
      id: draft.id,
      userId: draft.userId,
      content: draft.content,
      status: draft.status,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
      boostCount: draft._count.boosts,
    })),
    totalDrafts: drafts.length,
  });
});

