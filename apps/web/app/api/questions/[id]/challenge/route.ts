/**
 * POST /api/questions/[id]/challenge - Create challenge, return share URL
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError, validationError } from '@/lib/api-handler';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(req);
  if (!user) return authError();

  const { id: questionId } = await params;

  const question = await prisma.flowQuestion.findUnique({
    where: { id: questionId },
    select: { id: true, challengeEnabled: true },
  });
  if (!question || !question.challengeEnabled) {
    return validationError('Question is not challengeable');
  }

  const existingResponse = await prisma.userResponse.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
    select: { id: true },
  });

  const challenge = await prisma.questionChallenge.create({
    data: {
      questionId,
      challengerId: user.id,
      status: 'pending',
      challengerAnswerId: existingResponse?.id ?? undefined,
    },
  });

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || (host ? `${proto}://${host}` : '');
  const shareUrl = `${base}/challenge/${challenge.id}`;

  return successResponse({
    challengeId: challenge.id,
    shareUrl,
  });
}
