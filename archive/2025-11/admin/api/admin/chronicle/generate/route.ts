/**
 * Admin Chronicle Generate API
 * POST /api/admin/chronicle/generate - Generate a new chronicle entry
 * v0.36.43 - World Chronicle 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { generateChronicle } from '@/lib/chronicle/generator';
import { GenerateChronicleSchema } from '@/lib/chronicle/schemas';

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
 * POST /api/admin/chronicle/generate
 * Generate a new chronicle entry
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = GenerateChronicleSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { seasonId, weekNumber, startDate, endDate } = validation.data;

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const result = await generateChronicle({
    seasonId: seasonId || null,
    weekNumber,
    startDate: start,
    endDate: end,
  });

  if (!result.success) {
    return validationError(result.error || 'Failed to generate chronicle');
  }

  return successResponse({
    success: true,
    chronicleId: result.chronicleId,
    preview: result.preview,
    message: 'Chronicle generated successfully',
  });
});

