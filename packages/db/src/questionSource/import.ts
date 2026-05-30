import type { PrismaClient } from '@prisma/client';
import { normalizeQuestionText, normalizeSourceRow } from './normalize';
import { buildQuestionImportMetadata } from './options';
import { upsertTaxonomyFromRow } from './taxonomy';
import type {
  ImportSourceQuestionsResult,
  SourceQuestionRow,
} from './types';

export interface ImportSourceQuestionsOptions {
  sourceName?: string;
  /** When true, seed QuestionStats from import counters if present. */
  seedStats?: boolean;
}

export async function importSourceQuestions(
  prisma: PrismaClient,
  rows: SourceQuestionRow[],
  options: ImportSourceQuestionsOptions = {}
): Promise<ImportSourceQuestionsResult> {
  const sourceName = options.sourceName ?? 'external-catalog';
  const result: ImportSourceQuestionsResult = {
    processed: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    skips: [],
    taxonomyCreated: 0,
    taxonomyUpdated: 0,
    sourceName,
  };

  for (let i = 0; i < rows.length; i++) {
    result.processed++;
    const rowIndex = i + 1;

    const normalized = normalizeSourceRow(rows[i]);
    if (!normalized) {
      result.skipped++;
      result.skips.push({ row: rowIndex, reason: 'missing_text' });
      continue;
    }

    try {
      const taxonomy = await upsertTaxonomyFromRow(prisma, normalized);
      result.taxonomyCreated += taxonomy.created;
      result.taxonomyUpdated += taxonomy.updated;

      const normalizedText = normalizeQuestionText(normalized.text);
      const now = new Date();

      let existing =
        normalized.rowNumber != null
          ? await prisma.question.findFirst({
              where: { sourceName, sourceRowNumber: normalized.rowNumber },
            })
          : null;

      if (!existing) {
        existing = await prisma.question.findFirst({
          where: { normalizedText, sourceName },
        });
      }

      const questionData = {
        text: normalized.text,
        normalizedText,
        difficulty: normalized.difficulty ?? null,
        responseType: normalized.responseType ?? null,
        outcome: normalized.outcome ?? null,
        multiplication: normalized.multiplication ?? null,
        ageCategory: normalized.ageCategory ?? null,
        gender: normalized.gender ?? null,
        sourceAuthor: normalized.sourceAuthor ?? null,
        isWildcard: normalized.isWildcard,
        wildcardLabel: normalized.wildcardLabel ?? null,
        lifecycleStatus: normalized.lifecycleStatus,
        source: normalized.source,
        externalSourceLabel: normalized.externalSourceLabel ?? null,
        isSensitive: normalized.isSensitive,
        sensitivityLevel: normalized.sensitivityLevel,
        qualityScore: normalized.qualityScore ?? null,
        reviewNotes: normalized.reviewNotes ?? null,
        approvedAt: normalized.approvedAt ?? null,
        publishedAt: normalized.publishedAt ?? null,
        archivedAt: normalized.archivedAt ?? null,
        importedAt: now,
        sourceName,
        sourceRowNumber: normalized.rowNumber ?? null,
        categoryId: taxonomy.categoryId,
        subCategoryId: taxonomy.subCategoryId,
        subSubCategoryId: taxonomy.subSubCategoryId,
        ssscId: taxonomy.ssscId,
        relatedToId: normalized.relatedToId ?? null,
        approved:
          normalized.lifecycleStatus === 'APPROVED' ||
          normalized.lifecycleStatus === 'PUBLISHED',
        metadata: buildQuestionImportMetadata(normalized, existing?.metadata),
      };

      let questionId: string;

      if (existing) {
        await prisma.question.update({
          where: { id: existing.id },
          data: questionData,
        });
        questionId = existing.id;
        result.updated++;
      } else {
        const created = await prisma.question.create({ data: questionData });
        questionId = created.id;
        result.imported++;
      }

      if (
        options.seedStats &&
        (normalized.usageCount != null ||
          normalized.answerCount != null ||
          normalized.reportCount != null)
      ) {
        await prisma.questionStats.upsert({
          where: { questionId },
          create: {
            questionId,
            usageCount: normalized.usageCount ?? 0,
            answerCount: normalized.answerCount ?? 0,
            reportCount: normalized.reportCount ?? 0,
          },
          update: {
            usageCount: normalized.usageCount ?? 0,
            answerCount: normalized.answerCount ?? 0,
            reportCount: normalized.reportCount ?? 0,
          },
        });
      }
    } catch (err) {
      result.skipped++;
      result.skips.push({
        row: rowIndex,
        reason: 'taxonomy_error',
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
