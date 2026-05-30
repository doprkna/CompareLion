import type { PrismaClient, QuestionLifecycleStatus } from '@prisma/client';
import { syncPublishedQuestionsToFlow } from './projection';
import type { SyncPublishedToFlowResult } from './types';

const ELIGIBLE_STATUSES: QuestionLifecycleStatus[] = ['DRAFT', 'APPROVED'];

export type PublishSkipReason =
  | 'already_published'
  | 'ineligible_status'
  | 'high_sensitivity'
  | 'missing_source';

export interface PublishQuestionsOptions {
  sourceName: string;
  limit?: number;
  dryRun?: boolean;
  sync?: boolean;
  /** Allow publishing questions with sensitivityLevel HIGH. */
  allowSensitive?: boolean;
}

export interface PublishQuestionsResult {
  sourceName: string;
  selected: number;
  published: number;
  skipped: number;
  skips: { questionId: string; reason: PublishSkipReason; detail?: string }[];
  dryRun: boolean;
  sync?: SyncPublishedToFlowResult;
}

export async function publishSourceQuestions(
  prisma: PrismaClient,
  options: PublishQuestionsOptions
): Promise<PublishQuestionsResult> {
  const limit = options.limit ?? 50;
  const result: PublishQuestionsResult = {
    sourceName: options.sourceName,
    selected: 0,
    published: 0,
    skipped: 0,
    skips: [],
    dryRun: options.dryRun === true,
  };

  if (!options.sourceName?.trim()) {
    result.skipped = 0;
    result.skips.push({ questionId: '-', reason: 'missing_source' });
    return result;
  }

  const candidates = await prisma.question.findMany({
    where: {
      sourceName: options.sourceName,
      lifecycleStatus: { in: ELIGIBLE_STATUSES },
    },
    orderBy: [{ sourceRowNumber: 'asc' }, { createdAt: 'asc' }],
    take: limit,
    select: {
      id: true,
      text: true,
      sourceRowNumber: true,
      lifecycleStatus: true,
      sensitivityLevel: true,
      isSensitive: true,
      approvedAt: true,
      publishedAt: true,
    },
  });

  result.selected = candidates.length;
  const now = new Date();
  const toPublish: string[] = [];

  for (const q of candidates) {
    if (q.sensitivityLevel === 'HIGH' && !options.allowSensitive) {
      result.skipped++;
      result.skips.push({
        questionId: q.id,
        reason: 'high_sensitivity',
        detail: q.text.slice(0, 60),
      });
      continue;
    }
    toPublish.push(q.id);
  }

  if (options.dryRun) {
    result.published = toPublish.length;
    return result;
  }

  if (toPublish.length > 0) {
    await prisma.question.updateMany({
      where: { id: { in: toPublish } },
      data: {
        lifecycleStatus: 'PUBLISHED',
        approved: true,
      },
    });

    for (const id of toPublish) {
      const q = candidates.find((c) => c.id === id)!;
      await prisma.question.update({
        where: { id },
        data: {
          approvedAt: q.approvedAt ?? now,
          publishedAt: q.publishedAt ?? now,
        },
      });
    }
    result.published = toPublish.length;
  }

  if (options.sync) {
    result.sync = await syncPublishedQuestionsToFlow(prisma);
  }

  return result;
}
