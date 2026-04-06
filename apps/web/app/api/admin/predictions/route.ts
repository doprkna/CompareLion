/**
 * POST /api/admin/predictions - Admin: create prediction question
 */
import { NextRequest } from 'next/server';
import { successResponse, validationError } from '@/lib/api-handler';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const body = await req.json().catch(() => ({}));
  const title = body?.title as string | undefined;
  const description = body?.description as string | undefined;
  const options = Array.isArray(body?.options) ? body.options : undefined;
  const resolutionDate = body?.resolutionDate ? new Date(body.resolutionDate) : undefined;
  const categoryId = body?.categoryId ?? null;

  if (!title?.trim()) return validationError('title required');
  if (!options?.length || !options.every((o: unknown) => typeof o === 'string')) {
    return validationError('options must be non-empty string array');
  }

  const q = await prisma.predictionQuestion.create({
    data: {
      title: title.trim(),
      description: description?.trim() ?? null,
      options,
      resolutionDate: resolutionDate ?? null,
      categoryId,
      status: 'open',
    },
  });

  return successResponse({ id: q.id, title: q.title, status: q.status });
}
