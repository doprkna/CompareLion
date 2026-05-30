import type {
  QuestionLifecycleStatus,
  QuestionSensitivityLevel,
  QuestionSource,
  QuestionType,
} from '@prisma/client';

/** External catalog row (flexible keys for CSV/JSON headers). */
export type SourceQuestionRow = Record<string, unknown>;

export type ImportSkipReason =
  | 'missing_text'
  | 'duplicate'
  | 'taxonomy_error'
  | 'unsupported_response_type'
  | 'invalid_row';

export interface ImportSourceQuestionsResult {
  processed: number;
  imported: number;
  updated: number;
  skipped: number;
  skips: { row: number; reason: ImportSkipReason; detail?: string }[];
  taxonomyCreated: number;
  taxonomyUpdated: number;
  sourceName: string;
}

export interface SyncPublishedToFlowResult {
  publishedQuestions: number;
  flowUpserted: number;
  flowDeactivated: number;
  flowSkipped: number;
  skips: { questionId: string; reason: string }[];
  activeFlowQuestions: number;
}

export interface NormalizedSourceRow {
  rowNumber?: number;
  categoryName?: string;
  externalCId?: string;
  subCategoryName?: string;
  externalScId?: string;
  subSubCategoryName?: string;
  externalSscId?: string;
  sssCategoryName?: string;
  externalSssId?: string;
  relatedToId?: string;
  reviewNotes?: string;
  text: string;
  responseType?: QuestionType;
  outcome?: string;
  multiplication?: number;
  difficulty?: string;
  ageCategory?: string;
  gender?: string;
  sourceAuthor?: string;
  isWildcard: boolean;
  wildcardLabel?: string;
  lifecycleStatus: QuestionLifecycleStatus;
  source: QuestionSource;
  externalSourceLabel?: string;
  isSensitive: boolean;
  sensitivityLevel: QuestionSensitivityLevel;
  qualityScore?: number;
  approvedAt?: Date;
  publishedAt?: Date;
  archivedAt?: Date;
  usageCount?: number;
  answerCount?: number;
  reportCount?: number;
  importOptions?: { label: string; value: string; order: number }[];
}
