import type { Question, QuestionText, QuestionRelation } from '@parel/db/src/client';

export type QuestionDTO = {
  id: number;
  ssscId: number;
  format: string;
  responseType: string;
  outcome: string;
  multiplication: number;
  difficulty: number;
  ageCategory?: string;
  gender?: string;
  author?: string;
  wildcard: any;
  version: string;
  texts: { lang: string; text: string }[];
  relations: { relatedQuestionId: number; relationType: string }[];
};

export function toQuestionDTO(q: any): QuestionDTO {
  return {
    id: q.id,
    ssscId: q.ssscId,
    format: q.format,
    responseType: q.responseType,
    outcome: q.outcome,
    multiplication: q.multiplication,
    difficulty: q.difficulty,
    ageCategory: q.ageCategory,
    gender: q.gender,
    author: q.author,
    wildcard: q.wildcard,
    version: q.version,
    texts: q.texts?.map((t: any) => ({ lang: t.lang, text: t.text })) || [],
    relations: q.relations?.map((r: any) => ({ relatedQuestionId: r.relatedQuestionId, relationType: r.relationType })) || [],
  };
}
