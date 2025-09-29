import { z } from 'zod';

export const SssCategoryCreateSchema = z.object({
  label: z.string().min(1),
  subsubcategoryId: z.number().int(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  sizeTag: z.enum(["niche", "normal", "broad"]).default("normal"),
  version: z.string().default("v1"),
});

export const SssCategoryUpdateSchema = z.object({
  label: z.string().min(1).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  sizeTag: z.enum(["niche", "normal", "broad"]).optional(),
  lastRun: z.string().datetime().optional(),
  version: z.string().optional(),
});

