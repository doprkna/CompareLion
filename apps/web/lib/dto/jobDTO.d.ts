import { z } from 'zod';
declare let JobLogSchema: z.ZodType<any>;
export { JobLogSchema };
export type JobDTO = z.infer<typeof JobLogSchema>;
export declare function toJobDTO(job: unknown): JobDTO;
export declare function toJobDTOSafe(job: unknown): z.ZodSafeParseResult<any>;
