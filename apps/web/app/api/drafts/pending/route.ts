/**
 * Pending Drafts API
 * GET /api/drafts/pending - List pending drafts
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { DraftStatus } from '@/lib/drafts/types';

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

  // Power user = ADMIN or MODERATOR role
  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Power user access required');
  }

  return user.id;
}

/**
 * GET /api/drafts/pending
 * List pending drafts (power user only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requirePowerUser();

  const drafts = await prisma.draft.findMany({
    where: {
      status: DraftStatus.PENDING,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
      _count: {
        select: {
          boosts: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50, // Limit to 50 pending drafts
  });

  return successResponse({
    drafts: drafts.map(draft => ({
      id: draft.id,
      userId: draft.userId,
      content: draft.content,
      status: draft.status,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
      user: draft.user,
      boostCount: draft._count.boosts,
    })),
    totalPending: drafts.length,
  });
});

