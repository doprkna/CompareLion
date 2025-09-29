// DTO mapper accepts any shape matching the Prisma include payload
export function toQuestionDTO(q: any): {
  id: string;
  ssscId: string;
  format: string;
  responseType: string;
  outcome: string;
  multiplication: number;
  difficulty: number;
  ageCategory: string | null;
  gender: string | null;
  author: string | null;
  wildcard: boolean;
  texts: { lang: string; text: string }[];
  relations: { relatedQuestionId: string; relationType: string }[];
} {
  return {
    id: q.id.toString(),
    ssscId: q.ssscId.toString(),
    format: q.format,
    responseType: q.responseType,
    outcome: q.outcome,
    multiplication: q.multiplication,
    difficulty: q.difficulty,
    ageCategory: q.ageCategory ?? null,
    gender: q.gender ?? null,
    author: q.author ?? null,
    wildcard: Boolean(q.wildcard),
    texts: Array.isArray(q.texts) ? q.texts.map((t: any) => ({ lang: t.lang, text: t.text })) : [],
    relations: Array.isArray(q.relations)
      ? q.relations.map((r: any) => ({ relatedQuestionId: r.relatedQuestionId.toString(), relationType: r.relationType }))
      : [],
  };
}

export type QuestionDTO = ReturnType<typeof toQuestionDTO>;
