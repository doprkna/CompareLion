/**
 * OpsRun - Progress tracking for internal bots (QuestionGen, Wiki enrich).
 */
import type { PrismaClient } from '@prisma/client';

export type OpsRunType =
  | 'QUESTION_GEN'
  | 'WIKI_ENRICH'
  | 'SEED'
  | 'API_ERROR'
  | 'flow_start'
  | 'question_answer'
  | 'question_skip'
  | 'flow_complete';
export type OpsRunStatus = 'running' | 'success' | 'failed';

/** Normalized counts: always include these keys, default 0. */
export interface OpsRunCounts {
  scanned?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
  warnings?: number;
  [k: string]: number | undefined;
}

const COUNTS_KEYS = ['scanned', 'created', 'updated', 'skipped', 'failed', 'warnings'] as const;

function normalizeCounts(c?: OpsRunCounts): Record<string, number> {
  const out: Record<string, number> = {};
  for (const k of COUNTS_KEYS) {
    out[k] = typeof c?.[k] === 'number' ? c[k]! : 0;
  }
  return out;
}

const WARNINGS_CAP = 20;
const ERROR_STACK_CAP = 4000;

export async function createOpsRun(
  prisma: PrismaClient,
  type: OpsRunType,
  triggeredBy?: string,
  opts?: {
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
    params?: Record<string, unknown>;
    message?: string;
  }
) {
  return prisma.opsRun.create({
    data: {
      type,
      status: 'running',
      triggeredBy: triggeredBy ?? 'manual',
      entityType: opts?.entityType ?? undefined,
      entityId: opts?.entityId ?? undefined,
      entityLabel: opts?.entityLabel ?? undefined,
      params: (opts?.params as object) ?? undefined,
      message: opts?.message ?? undefined,
    },
  });
}

export async function finishOpsRun(
  prisma: PrismaClient,
  id: string,
  status: OpsRunStatus,
  opts?: {
    counts?: OpsRunCounts;
    message?: string;
    reportPath?: string;
    warnings?: unknown[];
    errorStack?: string;
  }
) {
  const run = await prisma.opsRun.findUnique({ where: { id } });
  if (!run) return null;
  const finishedAt = new Date();
  const durationMs = Math.round(finishedAt.getTime() - run.startedAt.getTime());
  const counts = normalizeCounts(opts?.counts);
  const warningsArr = Array.isArray(opts?.warnings) ? opts.warnings.slice(0, WARNINGS_CAP) : undefined;
  const errorStack =
    opts?.errorStack != null
      ? String(opts.errorStack).slice(0, ERROR_STACK_CAP)
      : undefined;
  return prisma.opsRun.update({
    where: { id },
    data: {
      status,
      finishedAt,
      durationMs,
      counts,
      message: opts?.message ?? undefined,
      reportPath: opts?.reportPath ?? undefined,
      warnings: warningsArr as object | undefined,
      errorStack,
    },
  });
}
