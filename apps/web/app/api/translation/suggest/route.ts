/**
 * POST /api/translation/suggest — Community translation suggestion (MVP)
 * v0.48.06
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, validationError } from '@/lib/api-handler';
import { z } from 'zod';

export const runtime = 'nodejs';

const BodySchema = z.object({
  entityType: z.enum(['question', 'poll']),
  entityId: z.string().min(1),
  language: z.string().min(1).max(32),
  original: z.string().min(1).max(20000),
  suggestion: z.string().min(1).max(20000),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const body = BodySchema.safeParse(await req.json());
  if (!body.success) {
    return validationError('Invalid body: entityType, entityId, language, original, suggestion required');
  }

  const { entityType, entityId, language, original, suggestion } = body.data;

  let userId: string | null = null;
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  await prisma.translationSuggestion.create({
    data: {
      userId,
      entityType,
      entityId,
      language: language.trim().toLowerCase(),
      original,
      suggestion,
      status: 'pending',
    },
  });

  return NextResponse.json({ success: true });
});
