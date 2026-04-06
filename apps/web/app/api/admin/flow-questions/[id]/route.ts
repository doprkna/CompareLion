/**
 * PATCH /api/admin/flow-questions/[id] - Update FlowQuestion tags (admin)
 */
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, notFoundError } from '@/lib/api-handler';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { normalizeTags } from '@/lib/tags';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const tags = Array.isArray(body?.tags) ? body.tags : [];

  const normalized = normalizeTags(tags);

  const q = await prisma.flowQuestion.findUnique({ where: { id } });
  if (!q) return notFoundError('FlowQuestion');

  await prisma.flowQuestion.update({
    where: { id },
    data: { tags: normalized },
  });

  return successResponse({
    id,
    tags: normalized,
    updatedAt: new Date().toISOString(),
  });
}
