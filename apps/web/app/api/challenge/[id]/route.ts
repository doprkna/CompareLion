/**
 * GET /api/challenge/[id] - Challenge details (public)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundError } from '@/lib/api-handler';

const EXPIRE_DAYS = 7;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const challenge = await prisma.questionChallenge.findUnique({
    where: { id },
    include: {
      question: {
        include: { options: { orderBy: { order: 'asc' } }, category: { select: { name: true } } },
      },
      challenger: { select: { name: true } },
    },
  });

  if (!challenge) return notFoundError('Challenge not found');

  let status = challenge.status;
  if (
    status === 'pending' &&
    challenge.createdAt &&
    Date.now() - challenge.createdAt.getTime() > EXPIRE_DAYS * 24 * 60 * 60 * 1000
  ) {
    status = 'expired';
    await prisma.questionChallenge.update({
      where: { id },
      data: { status: 'expired' },
    });
  }

  return successResponse({
    question: {
      id: challenge.question.id,
      text: challenge.question.text,
      type: challenge.question.type,
      options: challenge.question.options,
      categoryName: challenge.question.category?.name,
    },
    challengerBasicInfo: { name: challenge.challenger.name || 'A friend' },
    status,
  });
}
