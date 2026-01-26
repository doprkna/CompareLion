import { z } from 'zod';

// Validation schema for admin updating question fields
export const AdminUpdateQuestionDto = z.object({
  text: z.string().min(8).max(240).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  approved: z.boolean().optional(),
  reviewNotes: z.string().max(500).optional(),
});

// TypeScript type for admin update payload
export type AdminUpdateQuestion = z.infer<typeof AdminUpdateQuestionDto>;
