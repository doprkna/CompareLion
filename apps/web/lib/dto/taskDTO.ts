import { TaskSchema } from '@parel/db/generated';
import { z } from 'zod';

// Generated type from Prisma schema
export type TaskDTO = z.infer<typeof TaskSchema>;

// Zod-powered mapper with runtime validation
export function toTaskDTO(t: unknown): TaskDTO {
  return TaskSchema.parse(t);
}

// Optional: Safe parse version
export function toTaskDTOSafe(t: unknown) {
  return TaskSchema.safeParse(t);
}
