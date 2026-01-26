/**
 * Rating Template Service
 * User-created rating templates for AURE
 * v0.38.14 - Template Marketplace
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface MetricDefinition {
  id: string;
  label: string;
  description?: string;
}

export interface RatingTemplate {
  id: string;
  userId: string;
  name: string;
  categoryLabel: string;
  metrics: MetricDefinition[];
  promptTemplate: string;
  icon?: string | null;
  isPublic: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
  };
}

export interface CreateTemplateData {
  name: string;
  categoryLabel: string;
  metrics: MetricDefinition[];
  promptTemplate: string;
  icon?: string;
  isPublic: boolean;
}

/**
 * Validate template data
 */
function validateTemplate(data: CreateTemplateData): { valid: boolean; error?: string } {
  // Name validation
  if (!data.name || data.name.trim().length < 2 || data.name.length > 50) {
    return { valid: false, error: 'Name must be 2-50 characters' };
  }

  // Category label validation
  if (!data.categoryLabel || data.categoryLabel.trim().length < 2 || data.categoryLabel.length > 50) {
    return { valid: false, error: 'Category label must be 2-50 characters' };
  }

  // Metrics validation
  if (!Array.isArray(data.metrics) || data.metrics.length < 1 || data.metrics.length > 10) {
    return { valid: false, error: 'Must have 1-10 metrics' };
  }

  // Validate each metric
  for (const metric of data.metrics) {
    if (!metric.id || !metric.label) {
      return { valid: false, error: 'Each metric must have id and label' };
    }
    if (metric.id.length > 50 || metric.label.length > 50) {
      return { valid: false, error: 'Metric id and label must be <= 50 characters' };
    }
    // Basic sanitization: alphanumeric + underscore for id
    if (!/^[a-zA-Z0-9_]+$/.test(metric.id)) {
      return { valid: false, error: 'Metric id must be alphanumeric with underscores only' };
    }
  }

  // Prompt template validation
  if (!data.promptTemplate || data.promptTemplate.trim().length < 20 || data.promptTemplate.length > 2000) {
    return { valid: false, error: 'Prompt template must be 20-2000 characters' };
  }

  // Icon validation (optional)
  if (data.icon && data.icon.length > 10) {
    return { valid: false, error: 'Icon must be <= 10 characters (emoji or short text)' };
  }

  return { valid: true };
}

/**
 * Sanitize template data (basic offensive word filtering)
 */
function sanitizeTemplate(data: CreateTemplateData): CreateTemplateData {
  // Basic word filter (can be enhanced later)
  const offensiveWords = ['spam', 'scam', 'fake']; // Minimal list for MVP
  
  const lowerName = data.name.toLowerCase();
  const lowerCategory = data.categoryLabel.toLowerCase();
  
  for (const word of offensiveWords) {
    if (lowerName.includes(word) || lowerCategory.includes(word)) {
      throw new Error('Template name or category contains inappropriate content');
    }
  }

  return {
    ...data,
    name: data.name.trim(),
    categoryLabel: data.categoryLabel.trim(),
    promptTemplate: data.promptTemplate.trim(),
  };
}

/**
 * Create a new rating template
 */
export async function createTemplate(
  userId: string,
  data: CreateTemplateData
): Promise<RatingTemplate> {
  try {
    // Validate
    const validation = validateTemplate(data);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid template data');
    }

    // Sanitize
    const sanitized = sanitizeTemplate(data);

    // Create template
    const template = await prisma.ratingTemplate.create({
      data: {
        userId,
        name: sanitized.name,
        categoryLabel: sanitized.categoryLabel,
        metrics: sanitized.metrics as any, // JSON field
        promptTemplate: sanitized.promptTemplate,
        icon: sanitized.icon || null,
        isPublic: sanitized.isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: template.id,
      userId: template.userId,
      name: template.name,
      categoryLabel: template.categoryLabel,
      metrics: template.metrics as MetricDefinition[],
      promptTemplate: template.promptTemplate,
      icon: template.icon,
      isPublic: template.isPublic,
      createdAt: template.createdAt,
      user: template.user ? {
        id: template.user.id,
        name: template.user.name,
      } : undefined,
    };
  } catch (error: any) {
    logger.error('[TemplateService] Failed to create template', { userId, error });
    throw error;
  }
}

/**
 * Get public templates
 */
export async function getPublicTemplates(limit: number = 50): Promise<RatingTemplate[]> {
  try {
    const templates = await prisma.ratingTemplate.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return templates.map(t => ({
      id: t.id,
      userId: t.userId,
      name: t.name,
      categoryLabel: t.categoryLabel,
      metrics: t.metrics as MetricDefinition[],
      promptTemplate: t.promptTemplate,
      icon: t.icon,
      isPublic: t.isPublic,
      createdAt: t.createdAt,
      user: t.user ? {
        id: t.user.id,
        name: t.user.name,
      } : undefined,
    }));
  } catch (error) {
    logger.error('[TemplateService] Failed to get public templates', { error });
    return [];
  }
}

/**
 * Get user's own templates
 */
export async function getOwnTemplates(userId: string): Promise<RatingTemplate[]> {
  try {
    const templates = await prisma.ratingTemplate.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates.map(t => ({
      id: t.id,
      userId: t.userId,
      name: t.name,
      categoryLabel: t.categoryLabel,
      metrics: t.metrics as MetricDefinition[],
      promptTemplate: t.promptTemplate,
      icon: t.icon,
      isPublic: t.isPublic,
      createdAt: t.createdAt,
      user: t.user ? {
        id: t.user.id,
        name: t.user.name,
      } : undefined,
    }));
  } catch (error) {
    logger.error('[TemplateService] Failed to get own templates', { userId, error });
    return [];
  }
}

/**
 * Get template by ID
 */
export async function getTemplate(templateId: string): Promise<RatingTemplate | null> {
  try {
    const template = await prisma.ratingTemplate.findUnique({
      where: { id: templateId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!template) {
      return null;
    }

    return {
      id: template.id,
      userId: template.userId,
      name: template.name,
      categoryLabel: template.categoryLabel,
      metrics: template.metrics as MetricDefinition[],
      promptTemplate: template.promptTemplate,
      icon: template.icon,
      isPublic: template.isPublic,
      createdAt: template.createdAt,
      user: template.user ? {
        id: template.user.id,
        name: template.user.name,
      } : undefined,
    };
  } catch (error) {
    logger.error('[TemplateService] Failed to get template', { templateId, error });
    return null;
  }
}

