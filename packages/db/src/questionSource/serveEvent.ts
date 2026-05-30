import type { PrismaClient } from '@prisma/client';

export interface RecordFlowQuestionServeOptions {
  flowQuestionId: string;
  sourceQuestionId?: string | null;
  userId?: string | null;
  sessionId?: string | null;
  context?: string;
  metadata?: Record<string, unknown>;
}

/** Log a FlowQuestion serve/impression; increment QuestionStats.usageCount when linked. */
export async function recordFlowQuestionServe(
  prisma: PrismaClient,
  opts: RecordFlowQuestionServeOptions
): Promise<void> {
  try {
    await prisma.flowQuestionServeEvent.create({
      data: {
        flowQuestionId: opts.flowQuestionId,
        sourceQuestionId: opts.sourceQuestionId ?? null,
        userId: opts.userId ?? null,
        sessionId: opts.sessionId ?? null,
        context: opts.context ?? 'flow',
        metadata: opts.metadata ? (opts.metadata as object) : undefined,
      },
    });

    if (opts.sourceQuestionId) {
      await prisma.questionStats.upsert({
        where: { questionId: opts.sourceQuestionId },
        create: {
          questionId: opts.sourceQuestionId,
          usageCount: 1,
          answerCount: 0,
          reportCount: 0,
        },
        update: {
          usageCount: { increment: 1 },
        },
      });
    }
  } catch (e) {
    console.warn(
      '[recordFlowQuestionServe]',
      e instanceof Error ? e.message : String(e)
    );
  }
}
