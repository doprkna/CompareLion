import type { PrismaClient } from '@prisma/client';

export interface ReportFlowQuestionOptions {
  flowQuestionId: string;
  userId?: string | null;
  reason?: string;
  details?: string;
}

export interface ReportFlowQuestionResult {
  id: string;
  sourceQuestionId: string | null;
}

/** Record a FlowQuestion user report; increment QuestionStats.reportCount when linked. */
export async function reportFlowQuestion(
  prisma: PrismaClient,
  opts: ReportFlowQuestionOptions
): Promise<ReportFlowQuestionResult | null> {
  const flowQuestion = await prisma.flowQuestion.findUnique({
    where: { id: opts.flowQuestionId },
    select: { sourceQuestionId: true },
  });
  if (!flowQuestion) return null;

  try {
    const report = await prisma.questionReport.create({
      data: {
        questionId: opts.flowQuestionId,
        sourceQuestionId: flowQuestion.sourceQuestionId,
        userId: opts.userId ?? null,
        reason: opts.reason ?? 'OTHER',
        details: opts.details ?? null,
        status: 'OPEN',
      },
    });

    if (flowQuestion.sourceQuestionId) {
      try {
        await prisma.questionStats.upsert({
          where: { questionId: flowQuestion.sourceQuestionId },
          create: {
            questionId: flowQuestion.sourceQuestionId,
            usageCount: 0,
            answerCount: 0,
            reportCount: 1,
          },
          update: {
            reportCount: { increment: 1 },
          },
        });
      } catch (e) {
        console.warn(
          '[reportFlowQuestion] stats increment failed',
          e instanceof Error ? e.message : String(e)
        );
      }
    }

    return { id: report.id, sourceQuestionId: flowQuestion.sourceQuestionId };
  } catch (e) {
    console.warn(
      '[reportFlowQuestion]',
      e instanceof Error ? e.message : String(e)
    );
    return null;
  }
}
