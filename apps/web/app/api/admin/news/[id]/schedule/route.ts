/**
 * POST /api/admin/news/[id]/schedule - Set status=SCHEDULED, scheduledAt
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundError, errorResponse, parseBody } from '@/lib/api-handler';
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

  const body = await parseBody<{ scheduledAt: string }>(req);
  const scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
  if (!scheduledAt || isNaN(scheduledAt.getTime())) {
    return errorResponse('Invalid scheduledAt', 400);
  }

  const updated = await prisma.newsPost.update({
    where: { id },
    data: { status: 'SCHEDULED', scheduledAt },
  });
  return successResponse({ post: updated });
}
