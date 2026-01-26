/**
 * Story Template Service
 * Handles story template CRUD and application
 * v0.40.9 - Story Templates Marketplace 1.0 (User-Created Story Presets)
 */

import { prisma } from '@parel/db';
import { logger } from '@parel/core';

export interface StoryTemplateData {
  name: string;
  description: string;
  panelCount: number;
  layoutMode: 'vertical' | 'grid';
  panelLabels: string[];
  panelHelpTexts?: string[];
  isPublic: boolean;
}

export interface StoryTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  panelCount: number;
  layoutMode: 'vertical' | 'grid';
  panelLabels: string[];
  panelHelpTexts: string[];
  isPublic: boolean;
  createdAt: Date;
}

/**
 * Create story template
 */
export async function createStoryTemplate(
  userId: string,
  data: StoryTemplateData
): Promise<StoryTemplate> {
  try {
    // Validate panelCount
    if (data.panelCount < 1 || data.panelCount > 8) {
      throw new Error('panelCount must be between 1 and 8');
    }

    // Validate labels length matches panelCount
    if (data.panelLabels.length !== data.panelCount) {
      throw new Error(`panelLabels length (${data.panelLabels.length}) must match panelCount (${data.panelCount})`);
    }

    // Validate help texts length if provided
    if (data.panelHelpTexts && data.panelHelpTexts.length !== data.panelCount) {
      throw new Error(`panelHelpTexts length (${data.panelHelpTexts.length}) must match panelCount (${data.panelCount})`);
    }

    // Validate layoutMode
    if (data.layoutMode !== 'vertical' && data.layoutMode !== 'grid') {
      throw new Error('layoutMode must be "vertical" or "grid"');
    }

    const template = await prisma.storyTemplate.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        panelCount: data.panelCount,
        layoutMode: data.layoutMode,
        panelLabels: data.panelLabels,
        panelHelpTexts: data.panelHelpTexts || [],
        isPublic: data.isPublic,
      },
    });

    return {
      id: template.id,
      userId: template.userId,
      name: template.name,
      description: template.description,
      panelCount: template.panelCount,
      layoutMode: template.layoutMode as 'vertical' | 'grid',
      panelLabels: template.panelLabels as string[],
      panelHelpTexts: template.panelHelpTexts as string[],
      isPublic: template.isPublic,
      createdAt: template.createdAt,
    };
  } catch (error) {
    logger.error('[StoryTemplate] Failed to create template', { error, userId, data });
    throw error;
  }
}

/**
 * Get user's templates
 */
export async function getUserTemplates(userId: string): Promise<StoryTemplate[]> {
  try {
    const templates = await prisma.storyTemplate.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates.map((t) => ({
      id: t.id,
      userId: t.userId,
      name: t.name,
      description: t.description,
      panelCount: t.panelCount,
      layoutMode: t.layoutMode as 'vertical' | 'grid',
      panelLabels: t.panelLabels as string[],
      panelHelpTexts: t.panelHelpTexts as string[],
      isPublic: t.isPublic,
      createdAt: t.createdAt,
    }));
  } catch (error) {
    logger.error('[StoryTemplate] Failed to get user templates', { error, userId });
    throw error;
  }
}

/**
 * Get public templates
 */
export async function getPublicTemplates(): Promise<StoryTemplate[]> {
  try {
    const templates = await prisma.storyTemplate.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return templates.map((t) => ({
      id: t.id,
      userId: t.userId,
      name: t.name,
      description: t.description,
      panelCount: t.panelCount,
      layoutMode: t.layoutMode as 'vertical' | 'grid',
      panelLabels: t.panelLabels as string[],
      panelHelpTexts: t.panelHelpTexts as string[],
      isPublic: t.isPublic,
      createdAt: t.createdAt,
    }));
  } catch (error) {
    logger.error('[StoryTemplate] Failed to get public templates', { error });
    throw error;
  }
}

/**
 * Get template by ID
 */
export async function getTemplateById(templateId: string): Promise<StoryTemplate | null> {
  try {
    const template = await prisma.storyTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return null;
    }

    return {
      id: template.id,
      userId: template.userId,
      name: template.name,
      description: template.description,
      panelCount: template.panelCount,
      layoutMode: template.layoutMode as 'vertical' | 'grid',
      panelLabels: template.panelLabels as string[],
      panelHelpTexts: template.panelHelpTexts as string[],
      isPublic: template.isPublic,
      createdAt: template.createdAt,
    };
  } catch (error) {
    logger.error('[StoryTemplate] Failed to get template by ID', { error, templateId });
    throw error;
  }
}

/**
 * Apply template to story input (structural only, no AI)
 * Returns template metadata for UI to use
 */
export function applyTemplateToStoryInput(
  template: StoryTemplate
): {
  panelCount: number;
  layoutMode: 'vertical' | 'grid';
  panelLabels: string[];
  panelHelpTexts: string[];
} {
  return {
    panelCount: template.panelCount,
    layoutMode: template.layoutMode,
    panelLabels: template.panelLabels,
    panelHelpTexts: template.panelHelpTexts,
  };
}

