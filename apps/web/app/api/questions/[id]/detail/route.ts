/**
 * GET /api/questions/[id]/detail
 * Question + bookmarked + myLatestResponse + fastReport (free tier)
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError, notFoundError } from '@/lib/api-handler';
import { generateFastReport } from '@/lib/reports/fastQuestionReport';

function formatResponseValue(r: {
  optionIds: string[];
  numericVal: number | null;
  textVal: string | null;
  skipped: boolean;
}): string {
  if (r.skipped) return '(skipped)';
  if (r.textVal) return r.textVal;
  if (typeof r.numericVal === 'number') return String(r.numericVal);
  if (r.optionIds?.length) return r.optionIds.join(', ');
  return '(no value)';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id } = await params;

  const [question, bookmark, myResponse, userWithRegion] = await Promise.all([
    prisma.flowQuestion.findUnique({
      where: { id },
      include: {
        options: { orderBy: { order: 'asc' } },
        category: { select: { id: true, name: true } },
      },
    }),
    prisma.questionBookmark.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: id } },
    }),
    prisma.userResponse.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: id } },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { region: true, diamonds: true },
    }),
  ]);

  if (!question) return notFoundError('Question not found');

  const premiumEnabled =
    process.env.NEXT_PUBLIC_PREMIUM_FAST_REPORTS_ENABLED === 'true';
  const userDiamonds = userWithRegion?.diamonds ?? 0;
  const hasUnlock = await import('@/lib/reports/fastQuestionReport').then((m) =>
    m.hasPremiumUnlock(user.id, id)
  );

  const fastReport = await generateFastReport(
    { userId: user.id, questionId: id, region: userWithRegion?.region ?? 'global' },
    { premiumEnabled, userDiamonds, hasUnlock }
  );

  return successResponse({
    question: {
      id: question.id,
      text: question.text,
      type: question.type,
      categoryId: question.categoryId,
      categoryName: question.category?.name,
      options: question.options,
    },
    bookmarked: !!bookmark,
    myLatestResponse: myResponse
      ? {
          id: myResponse.id,
          value: formatResponseValue(myResponse),
          createdAt: myResponse.createdAt.toISOString(),
        }
      : undefined,
    fastReport,
  });
}
