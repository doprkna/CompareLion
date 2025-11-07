import { JobLogSchema } from '@parel/db/generated';
import { z } from 'zod';

// Generated type from Prisma schema
export type JobDTO = z.infer<typeof JobLogSchema>;

// Zod-powered mapper with runtime validation
export function toJobDTO(job: unknown): JobDTO {
  return JobLogSchema.parse(job);
}

// Optional: Safe parse version
export function toJobDTOSafe(job: unknown) {
  return JobLogSchema.safeParse(job);
}
