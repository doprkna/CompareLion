/**
 * Admin Companion Delete API
 * v0.36.20 - Unified Companion System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, successResponse, notFoundError } from '@/lib/api-handler';
import { UserRole } from '@parel/db/client';

export const runtime = 'nodejs';

/**
 * DELETE /api/admin/companions/[id]
 * Delete a companion
 */
export const DELETE = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return unauthorizedError('Admin access required');
  }

  const { id } = params;

  // Check if companion exists
  const companion = await prisma.companion.findUnique({
    where: { id },
  });

  if (!companion) {
    return notFoundError('Companion not found');
  }

  // Check if any users own this companion
  const userCompanions = await prisma.userCompanion.findMany({
    where: { companionId: id },
    take: 1,
  });

  if (userCompanions.length > 0) {
    return unauthorizedError('Cannot delete companion that is owned by users');
  }

  // Delete companion
  await prisma.companion.delete({
    where: { id },
  });

  return successResponse({
    message: 'Companion deleted successfully',
    id,
  });
});

