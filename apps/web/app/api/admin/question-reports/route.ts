/**
 * GET /api/admin/question-reports — List FlowQuestion reports (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import {
  listQuestionReportsForAdmin,
  QUESTION_REPORT_STATUSES,
  type QuestionReportStatus,
} from '@parel/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  const statusParam = req.nextUrl.searchParams.get('status');
  let status: QuestionReportStatus | undefined;
  if (statusParam) {
    if (!QUESTION_REPORT_STATUSES.includes(statusParam as QuestionReportStatus)) {
      return NextResponse.json(
        { ok: false, error: `status must be one of: ${QUESTION_REPORT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }
    status = statusParam as QuestionReportStatus;
  }

  try {
    const reports = await listQuestionReportsForAdmin(prisma, { status });
    return NextResponse.json({ ok: true, success: true, reports });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: 'GET /api/admin/question-reports', error: err });
    return NextResponse.json(
      { ok: false, success: false, error: err.slice(0, 280) },
      { status: 500 }
    );
  }
}
