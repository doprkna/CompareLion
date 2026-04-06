/**
 * POST /api/questions/[id]/bookmark - Bookmark question (idempotent)
 * DELETE /api/questions/[id]/bookmark - Remove bookmark
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id } = await params;

  await prisma.questionBookmark.upsert({
    where: {
      userId_questionId: { userId: user.id, questionId: id },
    },
    create: { userId: user.id, questionId: id },
    update: {},
  });

  return successResponse({ bookmarked: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id } = await params;

  await prisma.questionBookmark.deleteMany({
    where: { userId: user.id, questionId: id },
  });

  return successResponse({ bookmarked: false });
}
