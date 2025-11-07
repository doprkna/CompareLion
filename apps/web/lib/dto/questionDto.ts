import { FlowQuestionSchema } from '@parel/db/generated';
import { z } from 'zod';

// Generated type from Prisma schema
export type QuestionDTO = z.infer<typeof FlowQuestionSchema>;

// Zod-powered mapper with runtime validation
export function toQuestionDTO(q: unknown): QuestionDTO {
  return FlowQuestionSchema.parse(q);
}

// Optional: Safe parse version that returns { success, data, error }
export function toQuestionDTOSafe(q: unknown) {
  return FlowQuestionSchema.safeParse(q);
}
