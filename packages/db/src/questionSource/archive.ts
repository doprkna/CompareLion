import type { PrismaClient, QuestionLifecycleStatus } from '@prisma/client';

const ARCHIVABLE_STATUSES: QuestionLifecycleStatus[] = [
  'DRAFT',
  'REVIEW',
  'APPROVED',
  'PUBLISHED',
];

export type ArchiveSkipReason =
  | 'already_archived'
  | 'rejected'
  | 'ineligible_status'
  | 'missing_filter';

export interface ArchiveQuestionsOptions {
  questionId?: string;
  sourceName?: string;
  sourceRowNumber?: number;
  limit?: number;
  dryRun?: boolean;
  /** Deactivate linked FlowQuestion rows (default true). */
  deactivateFlow?: boolean;
}

export interface ArchiveQuestionsResult {
  selected: number;
  archived: number;
  skipped: number;
  flowDeactivated: number;
  skips: { questionId: string; reason: ArchiveSkipReason; detail?: string }[];
  dryRun: boolean;
}

export function validateArchiveFilters(options: ArchiveQuestionsOptions): string | null {
  const hasId = Boolean(options.questionId?.trim());
  const hasSource = Boolean(options.sourceName?.trim());
  const hasRow = options.sourceRowNumber != null;
  if (!hasId && !hasSource && !hasRow) {
    return 'Provide at least one filter: --question-id, --source, or --source-row (with --source)';
  }
  if (hasRow && !hasSource && !hasId) {
    return '--source-row requires --source or --question-id';
  }
  return null;
}

export async function archiveSourceQuestions(
  prisma: PrismaClient,
  options: ArchiveQuestionsOptions
): Promise<ArchiveQuestionsResult> {
  const filterError = validateArchiveFilters(options);
  const result: ArchiveQuestionsResult = {
    selected: 0,
    archived: 0,
    skipped: 0,
    flowDeactivated: 0,
    skips: [],
    dryRun: options.dryRun === true,
  };

  if (filterError) {
    result.skips.push({ questionId: '-', reason: 'missing_filter', detail: filterError });
    return result;
  }

  const limit = options.limit ?? 10;
  const deactivateFlow = options.deactivateFlow !== false;

  const where: {
    id?: string;
    sourceName?: string;
    sourceRowNumber?: number;
  } = {};

  if (options.questionId?.trim()) where.id = options.questionId.trim();
  if (options.sourceName?.trim()) where.sourceName = options.sourceName.trim();
  if (options.sourceRowNumber != null) where.sourceRowNumber = options.sourceRowNumber;

  const candidates = await prisma.question.findMany({
    where,
    orderBy: [{ sourceRowNumber: 'asc' }, { createdAt: 'asc' }],
    take: limit,
    select: {
      id: true,
      text: true,
      lifecycleStatus: true,
      archivedAt: true,
      flowProjection: { select: { id: true, isActive: true } },
    },
  });

  result.selected = candidates.length;
  const now = new Date();
  const toArchive: string[] = [];

  for (const q of candidates) {
    if (q.lifecycleStatus === 'ARCHIVED') {
      result.skipped++;
      result.skips.push({ questionId: q.id, reason: 'already_archived' });
      continue;
    }
    if (q.lifecycleStatus === 'REJECTED') {
      result.skipped++;
      result.skips.push({ questionId: q.id, reason: 'rejected', detail: q.text.slice(0, 60) });
      continue;
    }
    if (!ARCHIVABLE_STATUSES.includes(q.lifecycleStatus)) {
      result.skipped++;
      result.skips.push({
        questionId: q.id,
        reason: 'ineligible_status',
        detail: q.lifecycleStatus,
      });
      continue;
    }
    toArchive.push(q.id);
  }

  if (options.dryRun) {
    result.archived = toArchive.length;
    if (deactivateFlow) {
      result.flowDeactivated = candidates.filter(
        (q) => toArchive.includes(q.id) && q.flowProjection
      ).length;
    }
    return result;
  }

  for (const id of toArchive) {
    const q = candidates.find((c) => c.id === id)!;
    await prisma.question.update({
      where: { id },
      data: {
        lifecycleStatus: 'ARCHIVED',
        archivedAt: q.archivedAt ?? now,
        approved: false,
      },
    });
    result.archived++;

    if (deactivateFlow) {
      const updated = await prisma.flowQuestion.updateMany({
        where: { sourceQuestionId: id },
        data: { isActive: false },
      });
      result.flowDeactivated += updated.count;
    }
  }

  return result;
}
