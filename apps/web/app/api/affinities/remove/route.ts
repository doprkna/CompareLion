import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const RemoveSchema = z.object({ targetId: z.string().min(1), type: z.enum(['friend','rival','mentor','romance']) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = RemoveSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  // Delete both directions of this type
  await prisma.affinity.deleteMany({ where: {
    type: parsed.data.type,
    OR: [
      { sourceId: me.id, targetId: parsed.data.targetId },
      { sourceId: parsed.data.targetId, targetId: me.id },
    ]
  }});

  return NextResponse.json({ success: true, removed: true });
});


