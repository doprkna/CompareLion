/**
 * POST /api/charms/progress - Increment charm progress by key
 */
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { successResponse, unauthorizedError } from '@/lib/api-handler';
import { recordCharmProgress } from '@/lib/charms/dailyCharmsService';
import { z } from 'zod';

const BodySchema = z.object({ key: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return unauthorizedError();

  const body = await req.json();
  const { key } = BodySchema.parse(body);

  const data = await recordCharmProgress(user.id, key);
  return successResponse({
    progress: data.progress,
    target: data.target,
    completed: data.completed,
    xpGranted: data.xpGranted,
  });
}
