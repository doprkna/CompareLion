import type { PrismaClient, QuestionType } from '@prisma/client';
import type { SyncPublishedToFlowResult } from './types';
import {
  getImportOptionsFromMetadata,
  type ImportOption,
} from './options';
const SUPPORTED_TYPES: QuestionType[] = [
  'SINGLE_CHOICE',
  'MULTI_CHOICE',
  'RANGE',
  'NUMBER',
  'TEXT',
];

const DEFAULT_YES_NO_OPTIONS = [
  { label: 'Yes', value: 'yes', order: 0 },
  { label: 'No', value: 'no', order: 1 },
] as const;

function buildFlowTags(question: {
  difficulty: string | null;
  isWildcard: boolean;
  ageCategory: string | null;
  gender: string | null;
}): string[] {
  const tags: string[] = [];
  if (question.difficulty) tags.push(`difficulty:${question.difficulty}`);
  if (question.isWildcard) tags.push('wildcard');
  if (question.ageCategory) tags.push(`age:${question.ageCategory}`);
  if (question.gender) tags.push(`gender:${question.gender}`);
  return tags;
}

/** Seed Yes/No choices when projecting SINGLE_CHOICE questions with no options yet. */
async function ensureDefaultYesNoOptions(
  prisma: PrismaClient,
  flowQuestionId: string,
  responseType: QuestionType
): Promise<void> {
  if (responseType !== 'SINGLE_CHOICE') return;

  const existingCount = await prisma.flowQuestionOption.count({
    where: { questionId: flowQuestionId },
  });
  if (existingCount > 0) return;

  await prisma.flowQuestionOption.createMany({
    data: DEFAULT_YES_NO_OPTIONS.map((opt) => ({
      questionId: flowQuestionId,
      label: opt.label,
      value: opt.value,
      order: opt.order,
    })),
  });
}

/** Project imported custom options; skip overwrite when FlowQuestion has different options. */
async function ensureImportedOptions(
  prisma: PrismaClient,
  flowQuestionId: string,
  importOptions: ImportOption[]
): Promise<void> {
  const existing = await prisma.flowQuestionOption.findMany({
    where: { questionId: flowQuestionId },
    orderBy: { order: 'asc' },
  });

  const expectedValues = importOptions.map((o) => o.value);

  if (existing.length > 0) {
    const existingValues = existing.map((o) => o.value);
    const sameShape =
      existingValues.length === expectedValues.length &&
      existingValues.every((v, i) => v === expectedValues[i]);
    if (!sameShape) return;

    for (const opt of importOptions) {
      const match = existing.find((e) => e.value === opt.value);
      if (match && (match.label !== opt.label || match.order !== opt.order)) {
        await prisma.flowQuestionOption.update({
          where: { id: match.id },
          data: { label: opt.label, order: opt.order },
        });
      }
    }
    return;
  }

  await prisma.flowQuestionOption.createMany({
    data: importOptions.map((opt) => ({
      questionId: flowQuestionId,
      label: opt.label,
      value: opt.value,
      order: opt.order,
    })),
  });
}

async function ensureFlowQuestionOptions(
  prisma: PrismaClient,
  flowQuestionId: string,
  responseType: QuestionType,
  metadata: unknown
): Promise<void> {
  const importOptions = getImportOptionsFromMetadata(metadata);
  if (importOptions?.length) {
    await ensureImportedOptions(prisma, flowQuestionId, importOptions);
    return;
  }
  await ensureDefaultYesNoOptions(prisma, flowQuestionId, responseType);
}

export async function syncPublishedQuestionsToFlow(
  prisma: PrismaClient
): Promise<SyncPublishedToFlowResult> {
  const result: SyncPublishedToFlowResult = {
    publishedQuestions: 0,
    flowUpserted: 0,
    flowDeactivated: 0,
    flowSkipped: 0,
    skips: [],
    activeFlowQuestions: 0,
  };

  const deactivated = await prisma.flowQuestion.updateMany({
    where: {
      sourceQuestionId: { not: null },
      sourceQuestion: {
        lifecycleStatus: { not: 'PUBLISHED' },
      },
    },
    data: { isActive: false },
  });
  result.flowDeactivated = deactivated.count;

  const published = await prisma.question.findMany({
    where: { lifecycleStatus: 'PUBLISHED' },
    include: { sssc: true },
  });
  result.publishedQuestions = published.length;

  for (const question of published) {
    if (!question.ssscId || !question.sssc) {
      result.flowSkipped++;
      result.skips.push({
        questionId: question.id,
        reason: 'missing_sssc',
      });
      continue;
    }

    const responseType = question.responseType ?? 'SINGLE_CHOICE';
    if (!SUPPORTED_TYPES.includes(responseType)) {
      result.flowSkipped++;
      result.skips.push({
        questionId: question.id,
        reason: `unsupported_response_type:${responseType}`,
      });
      continue;
    }

    const tags = buildFlowTags(question);
    const arcStep = question.isWildcard ? 'wildcard' : undefined;

    const existing = await prisma.flowQuestion.findUnique({
      where: { sourceQuestionId: question.id },
    });

    let flowQuestionId: string;

    if (existing) {
      await prisma.flowQuestion.update({
        where: { id: existing.id },
        data: {
          text: question.text,
          type: responseType,
          categoryId: question.ssscId,
          isActive: true,
          tags,
          arcStep,
        },
      });
      flowQuestionId = existing.id;
    } else {
      const created = await prisma.flowQuestion.create({
        data: {
          text: question.text,
          type: responseType,
          categoryId: question.ssscId,
          isActive: true,
          tags,
          arcStep,
          sourceQuestionId: question.id,
        },
      });
      flowQuestionId = created.id;
    }

    await ensureFlowQuestionOptions(
      prisma,
      flowQuestionId,
      responseType,
      question.metadata
    );
    result.flowUpserted++;
  }

  result.activeFlowQuestions = await prisma.flowQuestion.count({
    where: { isActive: true },
  });

  return result;
}

export async function getQuestionPipelineCounts(prisma: PrismaClient) {
  const [
    importedQuestions,
    publishedQuestions,
    activeFlowQuestions,
    draftQuestions,
  ] = await Promise.all([
    prisma.question.count({ where: { sourceName: { not: null } } }),
    prisma.question.count({ where: { lifecycleStatus: 'PUBLISHED' } }),
    prisma.flowQuestion.count({ where: { isActive: true } }),
    prisma.question.count({ where: { lifecycleStatus: 'DRAFT' } }),
  ]);

  return {
    importedQuestions,
    publishedQuestions,
    draftQuestions,
    activeFlowQuestions,
  };
}
