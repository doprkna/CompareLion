/**
 * OpsRun - Progress tracking for internal bots (QuestionGen, Wiki enrich).
 */
import type { PrismaClient } from '@prisma/client';
export type OpsRunType = 'QUESTION_GEN' | 'WIKI_ENRICH' | 'SEED' | 'API_ERROR' | 'flow_start' | 'question_answer' | 'question_skip' | 'flow_complete';
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
export declare function createOpsRun(prisma: PrismaClient, type: OpsRunType, triggeredBy?: string, opts?: {
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
    params?: Record<string, unknown>;
    message?: string;
}): Promise<{
    id: string;
    type: string;
    status: string;
    startedAt: Date;
    finishedAt: Date | null;
    durationMs: number | null;
    counts: import("@prisma/client/runtime/library").JsonValue | null;
    message: string | null;
    reportPath: string | null;
    triggeredBy: string | null;
    entityType: string | null;
    entityId: string | null;
    entityLabel: string | null;
    params: import("@prisma/client/runtime/library").JsonValue | null;
    warnings: import("@prisma/client/runtime/library").JsonValue | null;
    errorStack: string | null;
}>;
export declare function finishOpsRun(prisma: PrismaClient, id: string, status: OpsRunStatus, opts?: {
    counts?: OpsRunCounts;
    message?: string;
    reportPath?: string;
    warnings?: unknown[];
    errorStack?: string;
}): Promise<{
    id: string;
    type: string;
    status: string;
    startedAt: Date;
    finishedAt: Date | null;
    durationMs: number | null;
    counts: import("@prisma/client/runtime/library").JsonValue | null;
    message: string | null;
    reportPath: string | null;
    triggeredBy: string | null;
    entityType: string | null;
    entityId: string | null;
    entityLabel: string | null;
    params: import("@prisma/client/runtime/library").JsonValue | null;
    warnings: import("@prisma/client/runtime/library").JsonValue | null;
    errorStack: string | null;
} | null>;
