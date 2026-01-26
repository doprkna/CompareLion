/**
 * Admin Material API (Single)
 * PUT /api/admin/materials/[id] - Update a material
 * DELETE /api/admin/materials/[id] - Delete a material
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody, notFoundError } from '@/lib/api-handler';
import { UpdateMaterialSchema } from '@/lib/crafting/schemas';

export const runtime = 'nodejs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * PUT /api/admin/materials/[id]
 * Update a material
 */
export const PUT = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const material = await prisma.material.findUnique({
    where: { id: params.id },
  });

  if (!material) {
    return notFoundError('Material');
  }

  const body = await parseBody(req);
  const validation = UpdateMaterialSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid material data', validation.error.issues);
  }

  try {
    const updated = await prisma.material.update({
      where: { id: params.id },
      data: validation.data,
    });

    return successResponse({
      material: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        rarity: updated.rarity,
        category: updated.category,
        icon: updated.icon,
        emoji: updated.emoji,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to update material'
    );
  }
});

/**
 * DELETE /api/admin/materials/[id]
 * Delete a material
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const material = await prisma.material.findUnique({
    where: { id: params.id },
  });

  if (!material) {
    return notFoundError('Material');
  }

  try {
    await prisma.material.delete({
      where: { id: params.id },
    });

    return successResponse({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to delete material'
    );
  }
});

