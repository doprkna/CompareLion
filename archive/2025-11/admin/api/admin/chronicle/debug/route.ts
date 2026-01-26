/**
 * Admin Chronicle Debug API
 * POST /api/admin/chronicle/debug - Preview chronicle stats without saving
 * v0.36.43 - World Chronicle 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { generateChronicleStats } from '@/lib/chronicle/generator';
import { PreviewChronicleSchema } from '@/lib/chronicle/schemas';

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
 * POST /api/admin/chronicle/debug
 * Preview chronicle stats without saving
 */
export const POST = safeAsync(async (req: NextRequest) => {
  await requireAdmin();

  const body = await parseBody(req);
  const validation = PreviewChronicleSchema.safeParse(body);

  if (!validation.success) {
    return validationError('Invalid request data', validation.error.issues);
  }

  const { seasonId, weekNumber, startDate, endDate } = validation.data;

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const stats = await generateChronicleStats({
    seasonId: seasonId || null,
    weekNumber,
    startDate: start,
    endDate: end,
  });

  return successResponse({
    preview: stats,
    weekNumber,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  });
});

