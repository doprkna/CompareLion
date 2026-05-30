import type { PrismaClient } from '@prisma/client';
import { countOpenQuestionReports } from './reportReview';

export interface AdminAttentionCounts {
  questionsInReview: number;
  draftImportedQuestions: number;
  publishedNotSynced: number;
  flowQuestionsMissingOptions: number;
  openQuestionReports: number;
  failedPipelineRuns: number;
}

export interface AdminAttentionItem {
  key: keyof AdminAttentionCounts;
  label: string;
  count: number;
  href: string;
}

export interface AdminAttentionStatus {
  needsAttention: boolean;
  totalAttentionCount: number;
  counts: AdminAttentionCounts;
  links: {
    questionPipeline: string;
    questionReports: string;
  };
  items: AdminAttentionItem[];
}

const LINKS = {
  questionPipeline: '/admin/question-pipeline',
  questionReports: '/admin/question-reports',
} as const;

async function countFailedPipelineRuns(prisma: PrismaClient): Promise<number> {
  try {
    const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'question_pipeline_runs'
      ) AS exists
    `;
    if (!rows[0]?.exists) return 0;

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return prisma.questionPipelineRun.count({
      where: { status: 'FAILED', completedAt: { gte: since } },
    });
  } catch {
    return 0;
  }
}

export async function getAdminAttentionStatus(
  prisma: PrismaClient
): Promise<AdminAttentionStatus> {
  const [
    questionsInReview,
    draftImportedQuestions,
    publishedNotSynced,
    flowQuestionsMissingOptions,
    openQuestionReports,
    failedPipelineRuns,
  ] = await Promise.all([
    prisma.question.count({
      where: { lifecycleStatus: { in: ['REVIEW', 'APPROVED'] } },
    }),
    prisma.question.count({
      where: { lifecycleStatus: 'DRAFT', sourceName: { not: null } },
    }),
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
    countOpenQuestionReports(prisma),
    countFailedPipelineRuns(prisma),
  ]);

  const counts: AdminAttentionCounts = {
    questionsInReview,
    draftImportedQuestions,
    publishedNotSynced,
    flowQuestionsMissingOptions,
    openQuestionReports,
    failedPipelineRuns,
  };

  const itemDefs: Omit<AdminAttentionItem, 'count'>[] = [
    {
      key: 'questionsInReview',
      label: 'Questions awaiting review/approval',
      href: LINKS.questionPipeline,
    },
    {
      key: 'draftImportedQuestions',
      label: 'Draft imported questions ready to publish',
      href: LINKS.questionPipeline,
    },
    {
      key: 'publishedNotSynced',
      label: 'Published questions not synced to FlowQuestion',
      href: LINKS.questionPipeline,
    },
    {
      key: 'flowQuestionsMissingOptions',
      label: 'Active FlowQuestions missing options',
      href: LINKS.questionPipeline,
    },
    {
      key: 'openQuestionReports',
      label: 'OPEN question reports',
      href: LINKS.questionReports,
    },
    {
      key: 'failedPipelineRuns',
      label: 'Failed pipeline runs (7d)',
      href: LINKS.questionPipeline,
    },
  ];

  const items: AdminAttentionItem[] = itemDefs
    .map((def) => ({ ...def, count: counts[def.key] }))
    .filter((item) => item.count > 0);

  const totalAttentionCount =
    questionsInReview +
    draftImportedQuestions +
    publishedNotSynced +
    flowQuestionsMissingOptions +
    openQuestionReports +
    failedPipelineRuns;

  return {
    needsAttention: totalAttentionCount > 0,
    totalAttentionCount,
    counts,
    links: { ...LINKS },
    items,
  };
}
