/**
 * Create Template API
 * Create a new user rating template
 * v0.38.14 - Template Marketplace
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { createTemplate } from '@/lib/rating/templateService';
import { CreateTemplateSchema } from '@/lib/rating/templateSchemas';

/**
 * POST /api/templates/create
 * Create a new rating template
 * Body: { name, categoryLabel, metrics, promptTemplate, icon?, isPublic }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = CreateTemplateSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid template data'
    );
  }

  try {
    const template = await createTemplate(user.id, validation.data);

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
      },
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to create template');
  }
});

