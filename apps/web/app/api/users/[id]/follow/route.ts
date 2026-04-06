/**
 * POST /api/users/[id]/follow - Follow user
 * DELETE /api/users/[id]/follow - Unfollow user
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError, validationError } from '@/lib/api-handler';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id: followedId } = await params;
  if (followedId === user.id) return validationError('Cannot follow yourself');

  await prisma.userFollow.upsert({
    where: {
      followerId_followedId: { followerId: user.id, followedId },
    },
    create: { followerId: user.id, followedId },
    update: {},
  });

  return successResponse({ following: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id: followedId } = await params;

  await prisma.userFollow.deleteMany({
    where: { followerId: user.id, followedId },
  });

  return successResponse({ following: false });
}
