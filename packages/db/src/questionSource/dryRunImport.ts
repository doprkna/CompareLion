import type { PrismaClient } from '@prisma/client';
import { normalizeQuestionText, normalizeSourceRow } from './normalize';
import { planTaxonomyFromRow } from './planTaxonomy';
import type { SourceQuestionRow } from './types';

export interface DryRunRowPlan {
  row: number;
  action: 'create' | 'update' | 'skip';
  text?: string;
  sourceRowNumber?: number;
  lifecycleStatus?: string;
  reason?: string;
  taxonomyCreate: number;
  taxonomyUpdate: number;
}

export interface DryRunImportResult {
  sourceName: string;
  processed: number;
  wouldImport: number;
  wouldUpdate: number;
  wouldSkip: number;
  taxonomyWouldCreate: number;
  taxonomyWouldUpdate: number;
  lifecycleCounts: Record<string, number>;
  skips: { row: number; reason: string; detail?: string }[];
  rows: DryRunRowPlan[];
}

export async function dryRunSourceQuestionsImport(
  prisma: PrismaClient,
  rows: SourceQuestionRow[],
  sourceName: string
): Promise<DryRunImportResult> {
  const result: DryRunImportResult = {
    sourceName,
    processed: 0,
    wouldImport: 0,
    wouldUpdate: 0,
    wouldSkip: 0,
    taxonomyWouldCreate: 0,
    taxonomyWouldUpdate: 0,
    lifecycleCounts: {},
    skips: [],
    rows: [],
  };

  for (let i = 0; i < rows.length; i++) {
    result.processed++;
    const rowIndex = i + 1;

    const normalized = normalizeSourceRow(rows[i]);
    if (!normalized) {
      result.wouldSkip++;
      result.skips.push({ row: rowIndex, reason: 'missing_text' });
      result.rows.push({ row: rowIndex, action: 'skip', reason: 'missing_text', taxonomyCreate: 0, taxonomyUpdate: 0 });
      continue;
    }

    const status = normalized.lifecycleStatus;
    result.lifecycleCounts[status] = (result.lifecycleCounts[status] ?? 0) + 1;

    try {
      const taxonomy = await planTaxonomyFromRow(prisma, normalized);
      result.taxonomyWouldCreate += taxonomy.wouldCreate;
      result.taxonomyWouldUpdate += taxonomy.wouldUpdate;

      const normalizedText = normalizeQuestionText(normalized.text);
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

      const action = existing ? 'update' : 'create';
      if (existing) result.wouldUpdate++;
      else result.wouldImport++;

      result.rows.push({
        row: rowIndex,
        action,
        text: normalized.text.slice(0, 80),
        sourceRowNumber: normalized.rowNumber,
        lifecycleStatus: status,
        taxonomyCreate: taxonomy.wouldCreate,
        taxonomyUpdate: taxonomy.wouldUpdate,
      });
    } catch (err) {
      result.wouldSkip++;
      const detail = err instanceof Error ? err.message : String(err);
      result.skips.push({ row: rowIndex, reason: 'plan_error', detail });
      result.rows.push({
        row: rowIndex,
        action: 'skip',
        reason: 'plan_error',
        taxonomyCreate: 0,
        taxonomyUpdate: 0,
      });
    }
  }

  return result;
}
