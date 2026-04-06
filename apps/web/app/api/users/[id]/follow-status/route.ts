/**
 * GET /api/users/[id]/follow-status - Check if current user follows target
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id: targetId } = await params;

  const follow = await prisma.userFollow.findUnique({
    where: {
      followerId_followedId: { followerId: user.id, followedId: targetId },
    },
  });

  return successResponse({ following: !!follow });
}
