/**
 * POST /api/admin/news/[id]/unpublish - Set status=DRAFT, clear publishedAt/scheduledAt
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundError } from '@/lib/api-handler';
import { requireAdminApi } from '@/lib/adminApiAuth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = await params;
  const post = await prisma.newsPost.findUnique({ where: { id } });
  if (!post) return notFoundError();

  const updated = await prisma.newsPost.update({
    where: { id },
    data: { status: 'DRAFT', publishedAt: null, scheduledAt: null },
  });
  return successResponse({ post: updated });
}
