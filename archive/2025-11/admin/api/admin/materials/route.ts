/**
 * Admin Materials API
 * GET /api/admin/materials - List all materials
 * POST /api/admin/materials - Create a new material
 * v0.36.40 - Materials & Crafting 1.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { CreateMaterialSchema, UpdateMaterialSchema } from '@/lib/crafting/schemas';

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
 * GET /api/admin/materials
 * List all materials
 */
export const GET = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const materials = await prisma.material.findMany({
    orderBy: [
      { rarity: 'asc' },
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  return successResponse({
    materials: materials.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      rarity: m.rarity,
      category: m.category,
      icon: m.icon,
      emoji: m.emoji,
      createdAt: m.createdAt.toISOString(),
    })),
    totalMaterials: materials.length,
  });
});

/**
 * POST /api/admin/materials
 * Create a new material
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = CreateMaterialSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid material data', validation.error.issues);
  }

  const { name, description, rarity, category, icon, emoji } = validation.data;

  try {
    const material = await prisma.material.create({
      data: {
        name,
        description,
        rarity,
        category,
        icon,
        emoji,
      },
    });

    return successResponse({
      material: {
        id: material.id,
        name: material.name,
        description: material.description,
        rarity: material.rarity,
        category: material.category,
        icon: material.icon,
        emoji: material.emoji,
      },
    });
  } catch (error) {
    return validationError(
      error instanceof Error ? error.message : 'Failed to create material'
    );
  }
});

