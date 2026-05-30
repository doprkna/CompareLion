import type {
  QuestionLifecycleStatus,
  QuestionSensitivityLevel,
  QuestionSource,
  QuestionType,
} from '@prisma/client';
import type { NormalizedSourceRow, SourceQuestionRow } from './types';
import { parseOptionsColumn } from './options';

function pick(row: SourceQuestionRow, ...keys: string[]): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return row[key];
    }
  }
  return undefined;
}

function asString(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function asInt(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function asFloat(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(v: unknown): boolean {
  if (v === true || v === 1) return true;
  const s = String(v ?? '').toLowerCase().trim();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y';
}

export function normalizeQuestionText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function mapResponseType(raw: unknown): QuestionType | undefined {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!s) return undefined;
  const map: Record<string, QuestionType> = {
    SINGLE_CHOICE: 'SINGLE_CHOICE',
    SINGLE: 'SINGLE_CHOICE',
    MULTI_CHOICE: 'MULTI_CHOICE',
    MULTI: 'MULTI_CHOICE',
    MULTIPLE_CHOICE: 'MULTI_CHOICE',
    RANGE: 'RANGE',
    NUMBER: 'NUMBER',
    NUMERIC: 'NUMBER',
    TEXT: 'TEXT',
    OPEN_TEXT: 'TEXT',
    FREE_TEXT: 'TEXT',
  };
  return map[s];
}

export function mapLifecycleStatus(raw: unknown): QuestionLifecycleStatus {
  const s = String(raw ?? '').toLowerCase().trim();
  if (!s) return 'DRAFT';
  if (s.includes('publish')) return 'PUBLISHED';
  if (s.includes('approv')) return 'APPROVED';
  if (s.includes('archiv')) return 'ARCHIVED';
  if (s.includes('reject')) return 'REJECTED';
  if (s.includes('review')) return 'REVIEW';
  if (s.includes('draft')) return 'DRAFT';
  return 'DRAFT';
}

export function mapSensitivityLevel(raw: unknown): QuestionSensitivityLevel {
  const s = String(raw ?? '').toUpperCase().trim();
  if (s === 'LOW') return 'LOW';
  if (s === 'MEDIUM') return 'MEDIUM';
  if (s === 'HIGH') return 'HIGH';
  return 'NONE';
}

export function mapQuestionSource(raw: unknown): QuestionSource {
  const s = String(raw ?? '').toLowerCase().trim();
  if (s === 'user') return 'user';
  if (s === 'ai') return 'ai';
  if (s.includes('import') || s.includes('excel') || s.includes('csv')) return 'import';
  return 'import';
}

export function normalizeSourceRow(row: SourceQuestionRow): NormalizedSourceRow | null {
  const text = asString(
    pick(
      row,
      'Final question text',
      'finalQuestionText',
      'final_question_text',
      'text',
      'question',
      'Question'
    )
  );
  if (!text) return null;

  const rowNumber = asInt(
    pick(row, 'N#', 'N', 'n', 'rowNumber', 'sourceRowNumber', 'id')
  );
  const wildcardRaw = pick(row, 'Wildcard', 'wildcard', 'isWildcard');
  const isWildcard = asBool(wildcardRaw) || Boolean(asString(wildcardRaw));

  return {
    rowNumber,
    categoryName: asString(pick(row, 'Category', 'category')),
    externalCId: asString(pick(row, 'C_ID', 'cId', 'c_id', 'externalCId')),
    subCategoryName: asString(pick(row, 'Subcategory', 'SubCategory', 'subcategory')),
    externalScId: asString(pick(row, 'SC_ID', 'scId', 'sc_id', 'externalScId')),
    subSubCategoryName: asString(
      pick(row, 'Subsubcategory', 'SubSubCategory', 'subsubcategory')
    ),
    externalSscId: asString(pick(row, 'SSC_ID', 'sscId', 'ssc_id', 'externalSscId')),
    sssCategoryName: asString(
      pick(row, 'SSS Category', 'SssCategory', 'sssCategory', 'sss_category')
    ),
    externalSssId: asString(pick(row, 'SSS_ID', 'sssId', 'sss_id', 'externalSssId')),
    relatedToId: asString(pick(row, 'ID relations', 'relatedToId', 'idRelations')),
    reviewNotes: asString(pick(row, 'Review', 'review', 'reviewNotes')),
    text,
    responseType: mapResponseType(pick(row, 'ResponseType', 'responseType', 'type')),
    outcome: asString(pick(row, 'Outcome', 'outcome')),
    multiplication: asInt(pick(row, 'Multiplication', 'multiplication')),
    difficulty: asString(pick(row, 'Difficulty', 'difficulty')),
    ageCategory: asString(pick(row, 'AgeCategory', 'ageCategory')),
    gender: asString(pick(row, 'gender', 'Gender')),
    sourceAuthor: asString(pick(row, 'Author', 'author', 'sourceAuthor')),
    isWildcard,
    wildcardLabel: isWildcard ? asString(wildcardRaw) : undefined,
    lifecycleStatus: mapLifecycleStatus(pick(row, 'status', 'Status')),
    source: mapQuestionSource(pick(row, 'Source', 'source')),
    externalSourceLabel: asString(pick(row, 'Source', 'sourceLabel')),
    isSensitive: asBool(pick(row, 'IsSensitive', 'isSensitive')),
    sensitivityLevel: mapSensitivityLevel(
      pick(row, 'SensitivityLevel', 'sensitivityLevel')
    ),
    qualityScore: asFloat(pick(row, 'QualityScore', 'qualityScore')),
    approvedAt: parseDate(pick(row, 'ApprovedAt', 'approvedAt')),
    publishedAt: parseDate(pick(row, 'PublishedAt', 'publishedAt')),
    archivedAt: parseDate(pick(row, 'ArchivedAt', 'archivedAt')),
    usageCount: asInt(pick(row, 'UsageCount', 'usageCount')),
    answerCount: asInt(pick(row, 'AnswerCount', 'answerCount')),
    reportCount: asInt(
      pick(row, 'Reported Count', 'ReportedCount', 'reportCount', 'reportedCount')
    ),
    importOptions: parseOptionsColumn(pick(row, 'Options', 'options')),
  };
}

function parseDate(v: unknown): Date | undefined {
  const s = asString(v);
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
