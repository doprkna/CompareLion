import { z } from 'zod';

export const GeneratedQuestion = z.object({
  text: z.string().min(8).max(240),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).max(5).optional(),
});

export const GeneratedQuestions = z.object({
  ssscId: z.string(),
  questions: z.array(GeneratedQuestion).min(1).max(50),
});

export type GeneratedQuestionsT = z.infer<typeof GeneratedQuestions>;
