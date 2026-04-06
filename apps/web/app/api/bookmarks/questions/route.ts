/**
 * GET /api/bookmarks/questions
 * Paginated list of bookmarked questions with latest response
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';

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

export async function GET(req: NextRequest) {
  const user = await getFlowUser(req);
  if (!user) return authError();

  const cursor = req.nextUrl.searchParams.get('cursor');
  const limit = Math.min(20, Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10)));

  const bookmarks = await prisma.questionBookmark.findMany({
    where: { userId: user.id },
    include: {
      question: {
        include: {
          category: { select: { id: true, name: true } },
          options: { select: { id: true, label: true, value: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = bookmarks.length > limit;
  const items = (hasMore ? bookmarks.slice(0, limit) : bookmarks);

  const questionIds = items.map((b) => b.questionId);
  const responses = await prisma.userResponse.findMany({
    where: { userId: user.id, questionId: { in: questionIds } },
  });
  const responseMap = new Map(responses.map((r) => [r.questionId, r]));

  const result = items.map((b) => {
    const myResp = responseMap.get(b.questionId);
    return {
      question: {
        id: b.question.id,
        text: b.question.text,
        categoryId: b.question.categoryId,
        categoryName: b.question.category?.name,
      },
      bookmarkedAt: b.createdAt.toISOString(),
      myLatestResponse: myResp
        ? {
            id: myResp.id,
            value: formatResponseValue(myResp),
            createdAt: myResp.createdAt.toISOString(),
          }
        : undefined,
    };
  });

  return successResponse({
    items: result,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}
