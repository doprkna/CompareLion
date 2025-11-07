import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';

const SubmitPackSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['POLL', 'REFLECTION', 'MISSION']),
  metadata: z.any().optional(), // Additional pack data (questions, rewards, etc.)
});

/**
 * POST /api/creator/submit
 * Creator submits new pack for approval
 * Auth required
 * v0.29.19 - Ops & Community Tools
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SubmitPackSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { title, description, type, metadata } = parsed.data;

  // Create creator pack
  const pack = await prisma.creatorPack.create({
    data: {
      creatorId: user.id,
      title: title.trim(),
      description: description?.trim() || undefined,
      type,
      status: 'DRAFT',
      metadata: metadata || undefined,
    },
  });

  return successResponse({
    success: true,
    pack: {
      id: pack.id,
      title: pack.title,
      type: pack.type,
      status: pack.status,
      createdAt: pack.createdAt,
    },
    message: 'Creator pack submitted successfully. It will be reviewed by admins.',
  });
});

