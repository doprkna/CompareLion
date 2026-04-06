/**
 * GET /api/flow/checkpoint?categoryId=xxx&answeredCount=N
 * Returns checkpoint insight for Arc System (C21). Called every 7–10 questions.
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, authError, validationError } from '@/lib/api-handler';

const CHECKPOINT_INTERVAL = 8;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get('categoryId');
  const answeredCount = parseInt(searchParams.get('answeredCount') ?? '0', 10);
  if (!categoryId) return validationError('categoryId required');

  const category = await prisma.sssCategory.findUnique({
    where: { id: categoryId },
    select: { name: true },
  });
  if (!category) return validationError('Category not found');

  const totalInCategory = await prisma.flowQuestion.count({
    where: { categoryId, isActive: true },
  });
  const progressPct = totalInCategory > 0
    ? Math.round((answeredCount / totalInCategory) * 100)
    : 0;

  const insightText =
    answeredCount >= CHECKPOINT_INTERVAL
      ? `You answered ${answeredCount} questions about ${category.name}. Keep going to unlock more insights.`
      : `Great progress! ${answeredCount} questions answered.`;

  return successResponse({
    topicName: category.name,
    answeredCount,
    totalQuestions: totalInCategory,
    progressPct,
    insightText,
  });
}
