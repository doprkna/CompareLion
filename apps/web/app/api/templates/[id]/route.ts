/**
 * Get Template API
 * Get a specific template by ID
 * v0.38.14 - Template Marketplace
 */

import { NextRequest } from 'next/server';
import { safeAsync, notFoundError, successResponse } from '@/lib/api-handler';
import { getTemplate } from '@/lib/rating/templateService';

/**
 * GET /api/templates/[id]
 * Get template by ID
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const templateId = params.id;

  try {
    const template = await getTemplate(templateId);

    if (!template) {
      return notFoundError('Template');
    }

    return successResponse({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        categoryLabel: template.categoryLabel,
        metrics: template.metrics,
        promptTemplate: template.promptTemplate,
        icon: template.icon,
        isPublic: template.isPublic,
        createdAt: template.createdAt.toISOString(),
        user: template.user,
      },
    });
  } catch (error: any) {
    return notFoundError('Template');
  }
});

