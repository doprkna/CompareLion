/**
 * GET /api/predictions/stats - Current user prediction stats
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';
import { getUserPredictionStats } from '@/lib/services/predictionService';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const stats = await getUserPredictionStats(user.id);
  return successResponse(stats);
}
