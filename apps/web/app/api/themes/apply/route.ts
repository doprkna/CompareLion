import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { getThemeByKey, getAllThemes } from '@/lib/themes';
import { z } from 'zod';

const ApplyThemeSchema = z.object({
  themeKey: z.string().min(1),
});

/**
 * POST /api/themes/apply
 * Saves themeKey to User.settings.themeKey
 * Auth required
 * v0.29.11 - Visual Identity & Theme Pass
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      settings: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ApplyThemeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { themeKey } = parsed.data;

  // Validate theme exists
  const theme = getThemeByKey(themeKey);
  if (!theme) {
    return validationError('Theme not found');
  }

  // Update user settings
  const currentSettings = (user.settings as any) || {};
  const updatedSettings = {
    ...currentSettings,
    themeKey,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      settings: updatedSettings,
    },
  });

  return successResponse({
    success: true,
    themeKey,
    theme: {
      key: theme.key,
      name: theme.name,
      emoji: theme.emoji,
    },
  });
});

