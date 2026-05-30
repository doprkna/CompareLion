/**
 * PATCH /api/admin/question-reports/[id] — Update report status (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, notFoundError } from '@/lib/api-handler';
import {
  updateQuestionReportStatus,
  QUESTION_REPORT_STATUSES,
  type QuestionReportStatus,
} from '@parel/db';
import { z } from 'zod';

export const runtime = 'nodejs';

const PatchSchema = z.object({
  status: z.enum(['REVIEWED', 'DISMISSED', 'ACTIONED']),
  reviewNote: z.string().max(2000).optional(),
});

export const PATCH = safeAsync(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const { id } = await params;
  const parsed = PatchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return validationError(
      `status must be one of: ${QUESTION_REPORT_STATUSES.filter((s) => s !== 'OPEN').join(', ')}`
    );
  }

  const updated = await updateQuestionReportStatus(
    prisma,
    id,
    parsed.data.status as QuestionReportStatus,
    parsed.data.reviewNote
  );

  if (!updated) {
    return notFoundError('QuestionReport');
  }

  return NextResponse.json({ ok: true, success: true, report: updated });
});
