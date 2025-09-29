import { z } from 'zod';

export const QuestionTextSchema = z.object({
  lang: z.string().min(2).max(5),
  text: z.string().min(1),
});

export const QuestionCreateSchema = z.object({
  ssscId: z.string(),
  format: z.enum(["WYR", "HYE"]),
  responseType: z.enum(["Y/N", "Select", "Open", "Range", "?"]),
  outcome: z.enum(["Continue", "Jump"]),
  multiplication: z.number().int().min(1).max(3),
  difficulty: z.number().int().min(1).max(3),
  ageCategory: z.string().optional(),
  gender: z.string().optional(),
  author: z.string().optional(),
  wildcard: z.any().optional(),
  version: z.string().default("v1"),
  texts: z.array(QuestionTextSchema).optional(),
});

export const QuestionUpdateSchema = QuestionCreateSchema.partial().extend({
  id: z.string().min(1),
});
