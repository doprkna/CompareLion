import { z } from 'zod';

export const JobStartSchema = z.object({
  runVersion: z.string().optional()
});