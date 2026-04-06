/**
 * POST /api/roadmap/[id]/vote
 * Auth required. Vote on roadmap item. +3 XP on first vote.
 * v0.45.1 - Roadmap MVP
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

const XP_PER_VOTE = 3;

export const POST = safeAsync(async (req: NextRequest, ctx?: { params?: { id?: string } }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Login required to vote');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return unauthorizedError('User not found');
  }

  const itemId = ctx?.params?.id;
  if (!itemId) {
    return unauthorizedError('Missing roadmap item id');
  }

  const item = await prisma.roadmapItem.findUnique({
    where: { id: itemId },
    select: { id: true },
  });
  if (!item) {
    return notFoundError('Roadmap item not found');
  }

  const existing = await prisma.roadmapVote.findUnique({
    where: { userId_roadmapItemId: { userId: user.id, roadmapItemId: itemId } },
  });

  if (existing) {
    const updated = await prisma.roadmapItem.findUnique({
      where: { id: itemId },
      select: { votesCount: true },
    });
    return successResponse({
      votesCount: updated?.votesCount ?? 0,
      hasVoted: true,
      xpAwarded: 0,
    });
  }

  await prisma.$transaction([
    prisma.roadmapVote.create({
      data: { userId: user.id, roadmapItemId: itemId },
    }),
    prisma.roadmapItem.update({
      where: { id: itemId },
      data: { votesCount: { increment: 1 } },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { xp: { increment: XP_PER_VOTE } },
    }),
  ]);

  const updated = await prisma.roadmapItem.findUnique({
    where: { id: itemId },
    select: { votesCount: true },
  });

  return successResponse({
    votesCount: updated?.votesCount ?? 1,
    hasVoted: true,
    xpAwarded: XP_PER_VOTE,
  });
});
