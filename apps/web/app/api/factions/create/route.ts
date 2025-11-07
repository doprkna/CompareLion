import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const CreateSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  motto: z.string().optional(),
  description: z.string().optional(),
  colorPrimary: z.string().min(1),
  colorSecondary: z.string().optional(),
  buffType: z.enum(['xp', 'gold', 'luck', 'karma', 'custom']).optional(),
  buffValue: z.number().optional(),
  regionScope: z.enum(['global', 'regional']).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') return unauthorizedError('Admin only');

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const faction = await prisma.faction.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      motto: parsed.data.motto,
      description: parsed.data.description,
      colorPrimary: parsed.data.colorPrimary,
      colorSecondary: parsed.data.colorSecondary,
      buffType: parsed.data.buffType || null,
      buffValue: parsed.data.buffValue || 1.05,
      regionScope: parsed.data.regionScope || 'global',
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, faction }, { status: 201 });
});

