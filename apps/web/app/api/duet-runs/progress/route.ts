import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ProgressSchema = z.object({
  duetRunId: z.string().min(1),
  progress: z.number().int().min(0).max(100),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = ProgressSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Find duet run
  const duetRun = await prisma.userDuetRun.findUnique({
    where: { id: parsed.data.duetRunId },
    include: { run: true },
  });

  if (!duetRun) return notFoundError('Duet run not found');
  if (duetRun.status !== 'active') {
    return validationError('Duet run is not active');
  }

  // Check if user is part of this duet
  const isUserA = duetRun.userA === user.id;
  const isUserB = duetRun.userB === user.id;
  if (!isUserA && !isUserB) {
    return unauthorizedError('Not authorized for this duet run');
  }

  // Update progress
  const updateData: any = {};
  if (isUserA) {
    updateData.progressA = parsed.data.progress;
  } else {
    updateData.progressB = parsed.data.progress;
  }

  await prisma.userDuetRun.update({
    where: { id: duetRun.id },
    data: updateData,
  });

  // Check if both completed
  const newProgressA = isUserA ? parsed.data.progress : duetRun.progressA;
  const newProgressB = isUserB ? parsed.data.progress : duetRun.progressB;

  const bothCompleted = newProgressA >= 100 && newProgressB >= 100;

  return NextResponse.json({
    success: true,
    progress: isUserA ? newProgressA : newProgressB,
    partnerProgress: isUserA ? newProgressB : newProgressA,
    bothCompleted,
  });
});

