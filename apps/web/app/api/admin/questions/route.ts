/**
 * GET  /api/admin/questions — pipeline status counts
 * POST /api/admin/questions — actions: sync | import | import-and-sync | counts (legacy)
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  archiveSourceQuestions,
  createOpsRun,
  finishOpsRun,
  getQuestionPipelineStatus,
  importSourceQuestions,
  syncPublishedQuestionsToFlow,
  runWithQuestionPipelineAudit,
} from '@parel/db';
import { prisma } from '@/lib/db';
import { requireAdminApi } from '@/lib/adminApiAuth';

type Action = 'import' | 'sync' | 'import-and-sync' | 'counts' | 'archive';

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  try {
    const status = await getQuestionPipelineStatus(prisma);
    return NextResponse.json({ success: true, ok: true, status });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: 'GET /api/admin/questions', error: err });
    return NextResponse.json(
      { success: false, ok: false, error: err.slice(0, 280) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.error;

  let opsRunId: string | null = null;

  try {
    const body = await req.json().catch(() => ({}));
    const action = (body.action ?? 'sync') as Action;
    const sourceName =
      typeof body.sourceName === 'string' ? body.sourceName : 'external-catalog';
    const seedStats = body.seedStats === true;
    const rows = Array.isArray(body.rows) ? body.rows : [];

    if (action === 'counts') {
      const status = await getQuestionPipelineStatus(prisma);
      return NextResponse.json({ success: true, ok: true, status });
    }

    if (action === 'sync') {
      const ops = await createOpsRun(prisma, 'QUESTION_SYNC', auth.userId, {
        message: 'Sync published Questions → FlowQuestion',
      });
      opsRunId = ops.id;

      const syncResult = await runWithQuestionPipelineAudit(
        prisma,
        'QUESTION_SYNC',
        { triggeredBy: auth.userId },
        () => syncPublishedQuestionsToFlow(prisma),
        (s) => ({
          counts: {
            recordsProcessed: s.flowUpserted + s.flowSkipped + s.flowDeactivated,
            recordsCreated: s.flowUpserted,
            recordsUpdated: s.flowDeactivated,
            recordsSkipped: s.flowSkipped,
          },
          summaryJson: {
            via: 'admin-api',
            activeFlowQuestions: s.activeFlowQuestions,
          },
        })
      );
      const status = await getQuestionPipelineStatus(prisma);

      await finishOpsRun(prisma, ops.id, 'success', {
        message: 'Question sync completed',
        counts: {
          flowUpserted: syncResult.flowUpserted,
          flowSkipped: syncResult.flowSkipped,
          flowDeactivated: syncResult.flowDeactivated,
        },
      });

      return NextResponse.json({
        success: true,
        ok: true,
        action: 'sync',
        sync: syncResult,
        status,
      });
    }

    if (action === 'archive') {
      const questionId =
        typeof body.questionId === 'string' ? body.questionId.trim() : '';
      if (!questionId) {
        return NextResponse.json(
          { success: false, ok: false, error: 'questionId required for archive' },
          { status: 400 }
        );
      }

      const ops = await createOpsRun(prisma, 'QUESTION_ARCHIVE', auth.userId, {
        message: `Archive question ${questionId}`,
        entityType: 'QUESTION',
        entityId: questionId,
      });
      opsRunId = ops.id;

      const archiveResult = await runWithQuestionPipelineAudit(
        prisma,
        'QUESTION_ARCHIVE',
        { triggeredBy: auth.userId },
        () => archiveSourceQuestions(prisma, { questionId }),
        (r) => ({
          counts: {
            recordsProcessed: r.selected,
            recordsUpdated: r.archived,
            recordsSkipped: r.skipped,
          },
          summaryJson: {
            via: 'admin-api',
            flowDeactivated: r.flowDeactivated,
          },
        })
      );
      const status = await getQuestionPipelineStatus(prisma);

      await finishOpsRun(prisma, ops.id, 'success', {
        message: 'Question archived',
        counts: {
          archived: archiveResult.archived,
          skipped: archiveResult.skipped,
          flowDeactivated: archiveResult.flowDeactivated,
        },
      });

      return NextResponse.json({
        success: true,
        ok: true,
        action: 'archive',
        archive: archiveResult,
        status,
      });
    }

    if (action !== 'import' && action !== 'import-and-sync') {
      return NextResponse.json(
        { success: false, ok: false, error: `Unknown action: ${action}` },
        { status: 400 }
      );
    }

    const ops = await createOpsRun(prisma, 'QUESTION_IMPORT', auth.userId, {
      message: `Question pipeline: ${action}`,
      params: { action, sourceName, rowCount: rows.length },
    });
    opsRunId = ops.id;

    let importResult = null;
    let syncResult = null;

    if (action === 'import' || action === 'import-and-sync') {
      if (rows.length === 0) {
        await finishOpsRun(prisma, ops.id, 'failed', {
          message: 'No rows provided for import',
        });
        return NextResponse.json(
          { success: false, ok: false, error: 'rows array required for import' },
          { status: 400 }
        );
      }
      importResult = await runWithQuestionPipelineAudit(
        prisma,
        'QUESTION_IMPORT',
        { triggeredBy: auth.userId, sourceName },
        () => importSourceQuestions(prisma, rows, { sourceName, seedStats }),
        (r) => ({
          counts: {
            recordsProcessed: r.processed,
            recordsCreated: r.imported,
            recordsUpdated: r.updated,
            recordsSkipped: r.skipped,
          },
          summaryJson: { via: 'admin-api', skips: r.skips.slice(0, 10) },
        })
      );
    }

    if (action === 'import-and-sync') {
      syncResult = await runWithQuestionPipelineAudit(
        prisma,
        'QUESTION_SYNC',
        { triggeredBy: auth.userId, sourceName },
        () => syncPublishedQuestionsToFlow(prisma),
        (s) => ({
          counts: {
            recordsProcessed: s.flowUpserted + s.flowSkipped + s.flowDeactivated,
            recordsCreated: s.flowUpserted,
            recordsUpdated: s.flowDeactivated,
            recordsSkipped: s.flowSkipped,
          },
          summaryJson: { via: 'admin-api' },
        })
      );
    }

    const status = await getQuestionPipelineStatus(prisma);

    await finishOpsRun(prisma, ops.id, 'success', {
      message: 'Question pipeline completed',
      counts: {
        ...(importResult
          ? {
              imported: importResult.imported,
              updated: importResult.updated,
              skipped: importResult.skipped,
            }
          : {}),
        ...(syncResult
          ? {
              flowUpserted: syncResult.flowUpserted,
              flowDeactivated: syncResult.flowDeactivated,
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      ok: true,
      action,
      import: importResult,
      sync: syncResult,
      status,
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('[API ERROR]', { route: 'POST /api/admin/questions', error: err });
    if (opsRunId) {
      try {
        await finishOpsRun(prisma, opsRunId, 'failed', {
          message: err.slice(0, 200),
          errorStack: e instanceof Error ? e.stack?.slice(0, 1000) : undefined,
        });
      } catch {
        /* ignore */
      }
    }
    return NextResponse.json(
      { success: false, ok: false, error: err.slice(0, 280) },
      { status: 500 }
    );
  }
}
