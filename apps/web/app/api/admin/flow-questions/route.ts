/**
 * GET /api/admin/flow-questions - List FlowQuestions with tags (admin)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse } from '@/lib/api-handler';
import { requireAdminApi } from '@/lib/adminApiAuth';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { searchParams } = req.nextUrl;
  const categoryId = searchParams.get('categoryId');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

  const questions = await prisma.flowQuestion.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: [{ createdAt: 'asc' }],
    take: limit,
    select: {
      id: true,
      text: true,
      type: true,
      categoryId: true,
      tags: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });

  return successResponse({
    items: questions.map((q) => ({
      id: q.id,
      text: q.text,
      type: q.type,
      categoryId: q.categoryId,
      categoryName: q.category?.name,
      tags: Array.isArray(q.tags) ? q.tags : [],
      createdAt: q.createdAt,
    })),
  });
}
