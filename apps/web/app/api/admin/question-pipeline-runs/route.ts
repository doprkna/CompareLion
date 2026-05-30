/**
 * GET /api/admin/question-pipeline-runs — Latest question pipeline audit runs (admin)
 */

import { NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/adminApiAuth';
import { prisma } from '@/lib/db';
import { listRecentQuestionPipelineRuns } from '@parel/db';

export const runtime = 'nodejs';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  try {
    const runs = await listRecentQuestionPipelineRuns(prisma, 20);
    return NextResponse.json({ ok: true, success: true, runs });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: 'GET /api/admin/question-pipeline-runs', error: err });
    return NextResponse.json(
      { ok: false, success: false, error: err.slice(0, 280) },
      { status: 500 }
    );
  }
}
