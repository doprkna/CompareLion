import type { PrismaClient } from '@prisma/client';

/** usageCount sourced from FlowQuestionServeEvent rows when available. */
export const USAGE_COUNT_FROM_SERVE_EVENTS =
  'usageCount = FlowQuestionServeEvent count (sourceQuestionId or flowQuestionId)';

/** Used when no serve events exist for a linked question. */
export const USAGE_COUNT_FALLBACK_NOTE =
  'usageCount falls back to answerCount when zero serve events exist';

/** Flow runtime reports only; excludes ModerationReport, Report, ContentReport. */
export const REPORT_COUNT_SCOPE =
  'QuestionReport count by sourceQuestionId or FlowQuestion.id (questionId)';

let questionReportsTableAvailable: boolean | null = null;
let serveEventsTableAvailable: boolean | null = null;

async function probeQuestionReportsTable(prisma: PrismaClient): Promise<boolean> {
  if (questionReportsTableAvailable !== null) return questionReportsTableAvailable;
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'question_reports'
      ) AS exists
    `;
    questionReportsTableAvailable = rows[0]?.exists === true;
  } catch {
    questionReportsTableAvailable = false;
  }
  return questionReportsTableAvailable;
}

export interface BackfillQuestionStatsResult {
  questionsScanned: number;
  statsCreated: number;
  statsUpdated: number;
  questionsWithoutFlowQuestion: number;
  questionsWithAnswers: number;
  questionsWithReports: number;
  questionsWithServeEvents: number;
  usageFallbackCount: number;
  usageSource: typeof USAGE_COUNT_FROM_SERVE_EVENTS;
  usageFallback: typeof USAGE_COUNT_FALLBACK_NOTE;
  reportScope: typeof REPORT_COUNT_SCOPE;
  excludedReportModels: string[];
}

export async function backfillQuestionStats(
  prisma: PrismaClient
): Promise<BackfillQuestionStatsResult> {
  const result: BackfillQuestionStatsResult = {
    questionsScanned: 0,
    statsCreated: 0,
    statsUpdated: 0,
    questionsWithoutFlowQuestion: 0,
    questionsWithAnswers: 0,
    questionsWithReports: 0,
    questionsWithServeEvents: 0,
    usageFallbackCount: 0,
    usageSource: USAGE_COUNT_FROM_SERVE_EVENTS,
    usageFallback: USAGE_COUNT_FALLBACK_NOTE,
    reportScope: REPORT_COUNT_SCOPE,
    excludedReportModels: ['ModerationReport', 'Report', 'ContentReport'],
  };

  const [linkedQuestions, withoutFlowCount] = await Promise.all([
    prisma.question.findMany({
      where: { flowProjection: { isNot: null } },
      select: {
        id: true,
        stats: { select: { questionId: true } },
        flowProjection: { select: { id: true } },
      },
    }),
    prisma.question.count({ where: { flowProjection: null } }),
  ]);

  result.questionsWithoutFlowQuestion = withoutFlowCount;
  result.questionsScanned = linkedQuestions.length;

  for (const question of linkedQuestions) {
    const flowQuestionId = question.flowProjection?.id;
    if (!flowQuestionId) continue;

    const [answerCount, reportCount, serveCount] = await Promise.all([
      prisma.userResponse.count({
        where: { questionId: flowQuestionId, skipped: false },
      }),
      countFlowQuestionReports(prisma, question.id, flowQuestionId),
      countServeEvents(prisma, question.id, flowQuestionId),
    ]);

    let usageCount = serveCount;
    if (serveCount > 0) {
      result.questionsWithServeEvents++;
    } else if (answerCount > 0) {
      usageCount = answerCount;
      result.usageFallbackCount++;
    }

    if (answerCount > 0) result.questionsWithAnswers++;
    if (reportCount > 0) result.questionsWithReports++;

    const hadStats = Boolean(question.stats);
    await prisma.questionStats.upsert({
      where: { questionId: question.id },
      create: {
        questionId: question.id,
        usageCount,
        answerCount,
        reportCount,
      },
      update: {
        usageCount,
        answerCount,
        reportCount,
      },
    });

    if (hadStats) result.statsUpdated++;
    else result.statsCreated++;
  }

  return result;
}

async function countServeEvents(
  prisma: PrismaClient,
  sourceQuestionId: string,
  flowQuestionId: string
): Promise<number> {
  if (serveEventsTableAvailable === false) return 0;
  try {
    const count = await prisma.flowQuestionServeEvent.count({
      where: {
        OR: [{ sourceQuestionId }, { flowQuestionId }],
      },
    });
    serveEventsTableAvailable = true;
    return count;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('flow_question_serve_events') || msg.includes('does not exist')) {
      serveEventsTableAvailable = false;
      return 0;
    }
    throw e;
  }
}

async function countFlowQuestionReports(
  prisma: PrismaClient,
  sourceQuestionId: string,
  flowQuestionId: string
): Promise<number> {
  const available = await probeQuestionReportsTable(prisma);
  if (!available) return 0;
  return prisma.questionReport.count({
    where: {
      OR: [{ sourceQuestionId }, { questionId: flowQuestionId }],
    },
  });
}

/** Increment canonical Question stats after a FlowQuestion answer (non-skipped). */
export async function incrementQuestionStatsForFlowAnswer(
  prisma: PrismaClient,
  flowQuestionId: string
): Promise<void> {
  const flowQuestion = await prisma.flowQuestion.findUnique({
    where: { id: flowQuestionId },
    select: { sourceQuestionId: true },
  });
  if (!flowQuestion?.sourceQuestionId) return;

  await prisma.questionStats.upsert({
    where: { questionId: flowQuestion.sourceQuestionId },
    create: {
      questionId: flowQuestion.sourceQuestionId,
      answerCount: 1,
      usageCount: 0,
      reportCount: 0,
    },
    update: {
      answerCount: { increment: 1 },
    },
  });
}
