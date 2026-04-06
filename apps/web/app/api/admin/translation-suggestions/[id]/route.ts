/**
 * PATCH /api/admin/translation-suggestions/[id] — Approve or reject (admin)
 * v0.48.06
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

export const runtime = 'nodejs';

const PatchSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const PATCH = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = params;
  const parsed = PatchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return validationError('status must be approved or rejected');
  }

  const existing = await prisma.translationSuggestion.findUnique({ where: { id } });
  if (!existing) {
    return notFoundError('TranslationSuggestion');
  }

  await prisma.translationSuggestion.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true, success: true });
});
