import type { PrismaClient } from '@prisma/client';

export const PIPELINE_RUN_STATUSES = [
  'RUNNING',
  'SUCCESS',
  'PARTIAL_SUCCESS',
  'FAILED',
] as const;

export type PipelineRunStatus = (typeof PIPELINE_RUN_STATUSES)[number];

export const QUESTION_PIPELINE_JOB_TYPES = [
  'QUESTION_IMPORT',
  'QUESTION_PUBLISH',
  'QUESTION_SYNC',
  'QUESTION_ARCHIVE',
  'QUESTION_STATS_BACKFILL',
  'QUESTION_REPORT_BACKFILL',
] as const;

export type QuestionPipelineJobType = (typeof QUESTION_PIPELINE_JOB_TYPES)[number];

const ERROR_MESSAGE_CAP = 500;

export interface PipelineRunCounts {
  recordsProcessed?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsSkipped?: number;
  errorCount?: number;
}

export interface QuestionPipelineRunRow {
  id: string;
  jobType: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationMs: number | null;
  triggeredBy: string | null;
  sourceName: string | null;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errorCount: number;
  summaryJson: Record<string, unknown> | null;
  errorMessage: string | null;
}

export interface LastFailedPipelineRun {
  id: string;
  jobType: string;
  completedAt: string;
  errorMessage: string | null;
  sourceName: string | null;
}

let pipelineRunsTableAvailable: boolean | null = null;

async function isPipelineRunsTableAvailable(prisma: PrismaClient): Promise<boolean> {
  if (pipelineRunsTableAvailable !== null) return pipelineRunsTableAvailable;
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'question_pipeline_runs'
      ) AS exists
    `;
    pipelineRunsTableAvailable = rows[0]?.exists === true;
  } catch {
    pipelineRunsTableAvailable = false;
  }
  return pipelineRunsTableAvailable;
}

export function resolvePipelineRunStatus(
  counts: PipelineRunCounts,
  hardFail: boolean
): PipelineRunStatus {
  if (hardFail) return 'FAILED';
  const errorCount = counts.errorCount ?? 0;
  const skipped = counts.recordsSkipped ?? 0;
  if (errorCount > 0) return 'PARTIAL_SUCCESS';
  if (skipped > 0) return 'PARTIAL_SUCCESS';
  return 'SUCCESS';
}

export async function startQuestionPipelineRun(
  prisma: PrismaClient,
  jobType: QuestionPipelineJobType,
  opts?: {
    triggeredBy?: string | null;
    sourceName?: string | null;
    summaryJson?: Record<string, unknown>;
  }
): Promise<string | null> {
  const available = await isPipelineRunsTableAvailable(prisma);
  if (!available) return null;

  try {
    const run = await prisma.questionPipelineRun.create({
      data: {
        jobType,
        status: 'RUNNING',
        triggeredBy: opts?.triggeredBy ?? null,
        sourceName: opts?.sourceName ?? null,
        summaryJson: opts?.summaryJson ? (opts.summaryJson as object) : undefined,
      },
    });
    return run.id;
  } catch (e) {
    console.warn(
      '[startQuestionPipelineRun]',
      e instanceof Error ? e.message : String(e)
    );
    return null;
  }
}

export async function finishQuestionPipelineRun(
  prisma: PrismaClient,
  runId: string | null,
  opts: {
    status: PipelineRunStatus;
    counts?: PipelineRunCounts;
    summaryJson?: Record<string, unknown>;
    errorMessage?: string | null;
  }
): Promise<void> {
  if (!runId) return;
  const available = await isPipelineRunsTableAvailable(prisma);
  if (!available) return;

  try {
    const run = await prisma.questionPipelineRun.findUnique({ where: { id: runId } });
    if (!run) return;

    const completedAt = new Date();
    const durationMs = Math.round(completedAt.getTime() - run.startedAt.getTime());
    const errorMessage =
      opts.errorMessage != null
        ? String(opts.errorMessage).slice(0, ERROR_MESSAGE_CAP)
        : undefined;

    await prisma.questionPipelineRun.update({
      where: { id: runId },
      data: {
        status: opts.status,
        completedAt,
        durationMs,
        recordsProcessed: opts.counts?.recordsProcessed ?? 0,
        recordsCreated: opts.counts?.recordsCreated ?? 0,
        recordsUpdated: opts.counts?.recordsUpdated ?? 0,
        recordsSkipped: opts.counts?.recordsSkipped ?? 0,
        errorCount: opts.counts?.errorCount ?? 0,
        summaryJson: opts.summaryJson ? (opts.summaryJson as object) : undefined,
        errorMessage,
      },
    });
  } catch (e) {
    console.warn(
      '[finishQuestionPipelineRun]',
      e instanceof Error ? e.message : String(e)
    );
  }
}

export async function runWithQuestionPipelineAudit<T>(
  prisma: PrismaClient,
  jobType: QuestionPipelineJobType,
  opts: {
    triggeredBy?: string | null;
    sourceName?: string | null;
    dryRun?: boolean;
  },
  fn: () => Promise<T>,
  mapResult: (result: T) => {
    counts: PipelineRunCounts;
    summaryJson?: Record<string, unknown>;
    status?: PipelineRunStatus;
  }
): Promise<T> {
  const runId = await startQuestionPipelineRun(prisma, jobType, {
    triggeredBy: opts.triggeredBy ?? 'cli',
    sourceName: opts.sourceName ?? null,
    summaryJson: opts.dryRun ? { dryRun: true } : undefined,
  });

  try {
    const result = await fn();
    const mapped = mapResult(result);
    const status =
      mapped.status ?? resolvePipelineRunStatus(mapped.counts, false);
    await finishQuestionPipelineRun(prisma, runId, {
      status,
      counts: mapped.counts,
      summaryJson: {
        ...(opts.dryRun ? { dryRun: true } : {}),
        ...mapped.summaryJson,
      },
    });
    return result;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await finishQuestionPipelineRun(prisma, runId, {
      status: 'FAILED',
      counts: { errorCount: 1 },
      errorMessage: msg,
      summaryJson: opts.dryRun ? { dryRun: true } : undefined,
    });
    throw e;
  }
}

function toRunRow(r: {
  id: string;
  jobType: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  durationMs: number | null;
  triggeredBy: string | null;
  sourceName: string | null;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errorCount: number;
  summaryJson: unknown;
  errorMessage: string | null;
}): QuestionPipelineRunRow {
  return {
    id: r.id,
    jobType: r.jobType,
    status: r.status,
    startedAt: r.startedAt.toISOString(),
    completedAt: r.completedAt?.toISOString() ?? null,
    durationMs: r.durationMs,
    triggeredBy: r.triggeredBy,
    sourceName: r.sourceName,
    recordsProcessed: r.recordsProcessed,
    recordsCreated: r.recordsCreated,
    recordsUpdated: r.recordsUpdated,
    recordsSkipped: r.recordsSkipped,
    errorCount: r.errorCount,
    summaryJson:
      r.summaryJson && typeof r.summaryJson === 'object' && !Array.isArray(r.summaryJson)
        ? (r.summaryJson as Record<string, unknown>)
        : null,
    errorMessage: r.errorMessage,
  };
}

export async function listRecentQuestionPipelineRuns(
  prisma: PrismaClient,
  limit = 20
): Promise<QuestionPipelineRunRow[]> {
  const available = await isPipelineRunsTableAvailable(prisma);
  if (!available) return [];

  const rows = await prisma.questionPipelineRun.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
  });
  return rows.map(toRunRow);
}

export async function getLastFailedQuestionPipelineRun(
  prisma: PrismaClient
): Promise<LastFailedPipelineRun | null> {
  const available = await isPipelineRunsTableAvailable(prisma);
  if (!available) return null;

  const row = await prisma.questionPipelineRun.findFirst({
    where: { status: 'FAILED' },
    orderBy: { completedAt: 'desc' },
  });
  if (!row?.completedAt) return null;

  return {
    id: row.id,
    jobType: row.jobType,
    completedAt: row.completedAt.toISOString(),
    errorMessage: row.errorMessage,
    sourceName: row.sourceName,
  };
}
