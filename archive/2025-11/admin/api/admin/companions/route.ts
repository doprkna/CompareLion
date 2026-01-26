/**
 * Admin Companions API
 * v0.36.17 - Companions + Pets System v0.1
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse, validationError, parseBody } from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';
import { seedCompanions } from '@/lib/rpg/seedCompanions';

export const runtime = 'nodejs';

/**
 * GET /api/admin/companions
 * List all companions
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  const companions = await prisma.companion.findMany({
    orderBy: {
      rarity: 'desc',
    },
  });

  return successResponse({
    companions: companions.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      rarity: c.rarity,
      icon: c.icon,
      description: (c as any).description || null,
      atkBonus: c.atkBonus,
      defBonus: c.defBonus,
      hpBonus: c.hpBonus,
      critBonus: c.critBonus,
      speedBonus: c.speedBonus,
      xpBonus: c.xpBonus,
      goldBonus: c.goldBonus,
      travelBonus: (c as any).travelBonus || 0,
    })),
  });
});

/**
 * POST /api/admin/companions
 * Create or update companion
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  const body = await parseBody<{
    id?: string;
    name: string;
    type: string;
    rarity: string;
    icon?: string;
    description?: string;
    atkBonus?: number;
    defBonus?: number;
    hpBonus?: number;
    critBonus?: number;
    speedBonus?: number;
    xpBonus?: number;
    goldBonus?: number;
    travelBonus?: number;
  }>(req);

  if (!body.name || !body.type || !body.rarity) {
    return validationError('Missing required fields: name, type, rarity');
  }

  if (body.id) {
    // Update existing
    const companion = await prisma.companion.update({
      where: { id: body.id },
      data: {
        name: body.name,
        type: body.type,
        rarity: body.rarity,
        icon: body.icon || null,
        description: body.description || null,
        atkBonus: body.atkBonus || 0,
        defBonus: body.defBonus || 0,
        hpBonus: body.hpBonus || 0,
        critBonus: body.critBonus || 0,
        speedBonus: body.speedBonus || 0,
        xpBonus: body.xpBonus || 0,
        goldBonus: body.goldBonus || 0,
        travelBonus: body.travelBonus || 0,
      },
    });

    return successResponse({ companion });
  } else {
    // Create new
    const companion = await prisma.companion.create({
      data: {
        name: body.name,
        type: body.type,
        rarity: body.rarity,
        icon: body.icon || null,
        description: body.description || null,
        atkBonus: body.atkBonus || 0,
        defBonus: body.defBonus || 0,
        hpBonus: body.hpBonus || 0,
        critBonus: body.critBonus || 0,
        speedBonus: body.speedBonus || 0,
        xpBonus: body.xpBonus || 0,
        goldBonus: body.goldBonus || 0,
        travelBonus: body.travelBonus || 0,
      },
    });

    return successResponse({ companion });
  }
});

/**
 * PUT /api/admin/companions/seed
 * Seed default companions
 */
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  const count = await seedCompanions();

  return successResponse({ 
    message: `Seeded ${count} companions`,
    count,
  });
}

