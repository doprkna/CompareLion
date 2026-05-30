/** Canonical source catalog columns (Excel/CSV export). */
export const CANONICAL_SOURCE_COLUMNS = [
  'N#',
  'Category',
  'C_ID',
  'Subcategory',
  'SC_ID',
  'Subsubcategory',
  'SSC_ID',
  'ID relations',
  'SSS Category',
  'SSS_ID',
  'Review',
  'Final question text',
  'ResponseType',
  'Options',
  'Outcome',
  'Multiplication',
  'Difficulty',
  'AgeCategory',
  'gender',
  'Author',
  'Wildcard',
  'status',
  'Source',
  'IsSensitive',
  'SensitivityLevel',
  'QualityScore',
  'UsageCount',
  'AnswerCount',
  'Reported Count',
  'CreatedAt',
  'UpdatedAt',
  'ApprovedAt',
  'PublishedAt',
  'ArchivedAt',
] as const;

/** Minimum columns required to import a row. */
export const REQUIRED_SOURCE_COLUMNS = [
  'N#',
  'Final question text',
  'Category',
  'Subcategory',
  'Subsubcategory',
  'SSS Category',
] as const;

export interface SourceColumnValidation {
  ok: boolean;
  present: string[];
  missing: string[];
  extra: string[];
}

export function validateSourceColumns(headers: string[]): SourceColumnValidation {
  const headerSet = new Set(headers.map((h) => h.trim()));
  const missing = REQUIRED_SOURCE_COLUMNS.filter((col) => !headerSet.has(col));
  const present = REQUIRED_SOURCE_COLUMNS.filter((col) => headerSet.has(col));
  const canonicalSet = new Set<string>(CANONICAL_SOURCE_COLUMNS);
  const extra = headers.filter((h) => h.trim() && !canonicalSet.has(h.trim()));
  return {
    ok: missing.length === 0,
    present,
    missing: [...missing],
    extra,
  };
}
