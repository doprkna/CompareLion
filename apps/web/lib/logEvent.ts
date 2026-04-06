/**
 * Lightweight user-flow trace: writes one-shot OpsRun rows (create + immediate success).
 * Fire-and-forget only — never await from latency-sensitive handlers.
 */
import { prisma } from '@/lib/db';
import { createOpsRun, finishOpsRun, type OpsRunType } from '@parel/db';

const TRACE_TYPES = [
  'flow_start',
  'question_answer',
  'question_skip',
  'flow_complete',
] as const satisfies readonly OpsRunType[];

export type UserFlowTraceType = (typeof TRACE_TYPES)[number];

export function logEvent(payload: {
  type: UserFlowTraceType;
  userId: string;
  message?: string;
  params?: Record<string, unknown>;
}): void {
  void (async () => {
    try {
      const { type, userId, message, params: extra } = payload;
      if (!userId) return;
      const run = await createOpsRun(prisma, type, userId, {
        message,
        params: { userId, ...extra },
      });
      await finishOpsRun(prisma, run.id, 'success', { message });
    } catch {
      /* never break app */
    }
  })();
}
