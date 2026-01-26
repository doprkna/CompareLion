/**
 * Rating Template Zod Schemas
 * Validation schemas for Template Marketplace API endpoints
 * v0.38.14 - Template Marketplace
 */

import { z } from 'zod';

const MetricDefinitionSchema = z.object({
  id: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Metric id must be alphanumeric with underscores only'),
  label: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

export const CreateTemplateSchema = z.object({
  name: z.string().min(2).max(50),
  categoryLabel: z.string().min(2).max(50),
  metrics: z.array(MetricDefinitionSchema).min(1).max(10),
  promptTemplate: z.string().min(20).max(2000),
  icon: z.string().max(10).optional(),
  isPublic: z.boolean(),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;

