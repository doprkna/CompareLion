import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const SetRoastSchema = z.object({
  level: z.number().int().min(1).max(5),
});

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, settings: true },
  });

  if (!user) return unauthorizedError('Unauthorized');

  // Extract roast level from settings (default to 3)
  const settings = (user.settings as any) || {};
  const roastLevel = settings.roastLevel || 3;

  return NextResponse.json({
    success: true,
    roastLevel,
  });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = SetRoastSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Update settings with new roast level
  const currentSettings = (user.settings as any) || {};
  const updatedSettings = {
    ...currentSettings,
    roastLevel: parsed.data.level,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      settings: updatedSettings,
    },
  });

  // Log action
  await prisma.actionLog.create({
    data: {
      userId: user.id,
      action: 'roast_level_update',
      metadata: {
        level: parsed.data.level,
      } as any,
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    roastLevel: parsed.data.level,
  });
});

