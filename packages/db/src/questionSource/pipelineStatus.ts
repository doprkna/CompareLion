import type { PrismaClient } from '@prisma/client';
import { countOpenQuestionReports } from './reportReview';
import { getLastFailedQuestionPipelineRun } from './pipelineRun';
import type { LastFailedPipelineRun } from './pipelineRun';

export interface QuestionPipelineStatus {
  totalQuestions: number;
  byLifecycle: Record<string, number>;
  bySourceName: { sourceName: string; count: number }[];
  publishedQuestions: number;
  activeFlowQuestions: number;
  linkedFlowQuestions: number;
  publishedWithoutProjection: number;
  flowQuestionsZeroOptions: number;
  flowQuestionsMissingCategory: number;
  highSensitivityUnpublished: number;
  openQuestionReports: number;
  lastFailedPipelineRun: LastFailedPipelineRun | null;
  warnings: string[];
}

export async function getQuestionPipelineStatus(
  prisma: PrismaClient
): Promise<QuestionPipelineStatus> {
  const [
    totalQuestions,
    lifecycleGroups,
    sourceGroups,
    publishedQuestions,
    activeFlowQuestions,
    linkedFlowQuestions,
    publishedWithoutProjection,
    flowQuestionsZeroOptions,
    flowQuestionsMissingCategory,
    highSensitivityUnpublished,
    openQuestionReports,
    lastFailedPipelineRun,
  ] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({
      by: ['lifecycleStatus'],
      _count: { _all: true },
    }),
    prisma.question.groupBy({
      by: ['sourceName'],
      where: { sourceName: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { sourceName: 'desc' } },
    }),
    prisma.question.count({ where: { lifecycleStatus: 'PUBLISHED' } }),
    prisma.flowQuestion.count({ where: { isActive: true } }),
    prisma.flowQuestion.count({ where: { sourceQuestionId: { not: null } } }),
    prisma.question.count({
      where: { lifecycleStatus: 'PUBLISHED', flowProjection: null },
    }),
    prisma.flowQuestion.count({
      where: {
        isActive: true,
        type: 'SINGLE_CHOICE',
        options: { none: {} },
      },
    }),
    prisma.flowQuestion.count({
      where: { isActive: true, categoryId: null },
    }),
    prisma.question.count({
      where: {
        lifecycleStatus: { in: ['DRAFT', 'REVIEW', 'APPROVED'] },
        sensitivityLevel: 'HIGH',
      },
    }),
    countOpenQuestionReports(prisma),
    getLastFailedQuestionPipelineRun(prisma),
  ]);

  const byLifecycle: Record<string, number> = {};
  for (const g of lifecycleGroups) {
    byLifecycle[g.lifecycleStatus] = g._count._all;
  }

  const bySourceName = sourceGroups
    .filter((g) => g.sourceName != null)
    .map((g) => ({
      sourceName: g.sourceName as string,
      count: g._count._all,
    }));

  const warnings: string[] = [];
  if (publishedWithoutProjection > 0) {
    warnings.push(
      `${publishedWithoutProjection} published Question(s) have no FlowQuestion projection`
    );
  }
  if (flowQuestionsZeroOptions > 0) {
    warnings.push(
      `${flowQuestionsZeroOptions} active SINGLE_CHOICE FlowQuestion(s) have zero options`
    );
  }
  if (flowQuestionsMissingCategory > 0) {
    warnings.push(
      `${flowQuestionsMissingCategory} active FlowQuestion(s) missing SssCategory (categoryId null)`
    );
  }
  if (highSensitivityUnpublished > 0) {
    warnings.push(
      `${highSensitivityUnpublished} unpublished Question(s) with HIGH sensitivity`
    );
  }
  if (openQuestionReports > 0) {
    warnings.push(
      `${openQuestionReports} OPEN FlowQuestion report(s) awaiting review — see /admin/question-reports`
    );
  }
  if (lastFailedPipelineRun) {
    const when = new Date(lastFailedPipelineRun.completedAt).toISOString();
    const err = lastFailedPipelineRun.errorMessage
      ? ` — ${lastFailedPipelineRun.errorMessage.slice(0, 120)}`
      : '';
    warnings.push(
      `Last failed pipeline run: ${lastFailedPipelineRun.jobType} at ${when}${err} — see /admin/question-pipeline`
    );
  }

  return {
    totalQuestions,
    byLifecycle,
    bySourceName,
    publishedQuestions,
    activeFlowQuestions,
    linkedFlowQuestions,
    publishedWithoutProjection,
    flowQuestionsZeroOptions,
    flowQuestionsMissingCategory,
    highSensitivityUnpublished,
    openQuestionReports,
    lastFailedPipelineRun,
    warnings,
  };
}
