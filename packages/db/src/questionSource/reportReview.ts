import type { PrismaClient } from '@prisma/client';

export const QUESTION_REPORT_STATUSES = [
  'OPEN',
  'REVIEWED',
  'DISMISSED',
  'ACTIONED',
] as const;

export type QuestionReportStatus = (typeof QUESTION_REPORT_STATUSES)[number];

export interface AdminQuestionReportRow {
  id: string;
  flowQuestionId: string;
  sourceQuestionId: string | null;
  questionText: string | null;
  reason: string | null;
  details: string | null;
  reviewNote: string | null;
  status: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

let questionReportsTableAvailable: boolean | null = null;

export async function isQuestionReportsTableAvailable(
  prisma: PrismaClient
): Promise<boolean> {
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

const STATUS_SORT: Record<string, number> = {
  OPEN: 0,
  REVIEWED: 1,
  DISMISSED: 2,
  ACTIONED: 3,
};

export async function countOpenQuestionReports(prisma: PrismaClient): Promise<number> {
  const available = await isQuestionReportsTableAvailable(prisma);
  if (!available) return 0;
  return prisma.questionReport.count({ where: { status: 'OPEN' } });
}

export async function listQuestionReportsForAdmin(
  prisma: PrismaClient,
  opts?: { status?: QuestionReportStatus; limit?: number }
): Promise<AdminQuestionReportRow[]> {
  const available = await isQuestionReportsTableAvailable(prisma);
  if (!available) return [];

  const limit = opts?.limit ?? 200;
  const where = opts?.status ? { status: opts.status } : undefined;

  const rows = await prisma.questionReport.findMany({
    where,
    take: limit,
    include: {
      flowQuestion: { select: { text: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  rows.sort((a, b) => {
    const sa = STATUS_SORT[a.status] ?? 99;
    const sb = STATUS_SORT[b.status] ?? 99;
    if (sa !== sb) return sa - sb;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return rows.map((r) => ({
    id: r.id,
    flowQuestionId: r.questionId,
    sourceQuestionId: r.sourceQuestionId,
    questionText: r.flowQuestion?.text ?? null,
    reason: r.reason,
    details: r.details,
    reviewNote: r.reviewNote,
    status: r.status,
    userId: r.userId,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function updateQuestionReportStatus(
  prisma: PrismaClient,
  reportId: string,
  status: QuestionReportStatus,
  reviewNote?: string | null
): Promise<AdminQuestionReportRow | null> {
  const available = await isQuestionReportsTableAvailable(prisma);
  if (!available) return null;

  const existing = await prisma.questionReport.findUnique({
    where: { id: reportId },
    include: { flowQuestion: { select: { text: true } } },
  });
  if (!existing) return null;

  const updated = await prisma.questionReport.update({
    where: { id: reportId },
    data: {
      status,
      ...(reviewNote !== undefined ? { reviewNote } : {}),
    },
    include: { flowQuestion: { select: { text: true } } },
  });

  return {
    id: updated.id,
    flowQuestionId: updated.questionId,
    sourceQuestionId: updated.sourceQuestionId,
    questionText: updated.flowQuestion?.text ?? null,
    reason: updated.reason,
    details: updated.details,
    reviewNote: updated.reviewNote,
    status: updated.status,
    userId: updated.userId,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}
