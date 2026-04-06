/**
 * GET /api/questions/[id]/reaction - My reaction + counts
 * PUT /api/questions/[id]/reaction - Set reaction (LIKE | DISLIKE | NONE)
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const PutSchema = z.object({
  type: z.enum(['LIKE', 'DISLIKE', 'NONE']),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  const { id: questionId } = await params;

  const question = await prisma.flowQuestion.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!question) return validationError('Question not found');

  const [myReaction, likeCount, dislikeCount] = await Promise.all([
    user
      ? prisma.questionReaction.findUnique({
          where: { userId_questionId: { userId: user.id, questionId } },
          select: { type: true },
        })
      : null,
    prisma.questionReaction.count({
      where: { questionId, type: 'LIKE' },
    }),
    prisma.questionReaction.count({
      where: { questionId, type: 'DISLIKE' },
    }),
  ]);

  return successResponse({
    myReaction: myReaction?.type ?? null,
    likeCount,
    dislikeCount,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(req);
  if (!user) return authError();

  const { id: questionId } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) return validationError('type must be LIKE, DISLIKE, or NONE');

  const question = await prisma.flowQuestion.findUnique({
    where: { id: questionId },
    select: { id: true },
  });
  if (!question) return validationError('Question not found');

  if (parsed.data.type === 'NONE') {
    await prisma.questionReaction.deleteMany({
      where: { userId: user.id, questionId },
    });
    return successResponse({ myReaction: null });
  }

  await prisma.questionReaction.upsert({
    where: { userId_questionId: { userId: user.id, questionId } },
    create: { userId: user.id, questionId, type: parsed.data.type },
    update: { type: parsed.data.type },
  });

  return successResponse({ myReaction: parsed.data.type });
}
