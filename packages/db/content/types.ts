/**
 * Content pack v1 types
 * C10 - Content Pack Packaging
 */

export interface PackManifest {
  packKey: string;
  version: string;
  type: string;
  title?: string;
  description?: string;
  schemaVersion: number;
  createdAt?: string;
  source?: string;
}

export interface FlowQuestionRecord {
  id: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'NUMERIC' | 'MULTIPLE_CHOICE';
  opts?: Array<{ label: string; value: string; order: number }>;
  /** Tag System v1 - semantic labels: lowercase, short, single concept */
  tags?: string[];
  /** Arc step (C21): entry|context|reflection|comparison|wildcard */
  arcStep?: string;
}

export interface PollRecord {
  question: string;
  options: string[];
  allowFreetext: boolean;
}
