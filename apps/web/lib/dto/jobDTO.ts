import { z } from 'zod';

// Fallback schema for build safety (when @parel/db/generated is not available)
const FallbackJobLogSchema = z.object({
  id: z.string(),
  type: z.string(),
  status: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
}).passthrough();

// Try to import JobLogSchema, fallback to stub
let JobLogSchema: z.ZodType<any>;
try {
  JobLogSchema = require('@parel/db/generated').JobLogSchema;
} catch {
  JobLogSchema = FallbackJobLogSchema;
}

// Export schema for external use
export { JobLogSchema };

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
