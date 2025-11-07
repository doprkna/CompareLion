import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const CreatePollSchema = z.object({
  title: z.string().min(3).max(120),
  question: z.string().min(3).max(280),
  options: z.array(z.string().min(1).max(100)).min(2).max(8),
  region: z.string().max(16).optional(),
  visibility: z.enum(['public', 'unlisted', 'archived']).optional().default('public'),
  allowFreetext: z.boolean().optional().default(false),
  premiumCost: z.number().int().min(0).max(10000).optional().default(0),
  rewardXP: z.number().int().min(0).max(1000).optional().default(50),
  expiresAt: z.string().datetime().optional(),
});

function resolveRegionChain(region?: string | null): string[] {
  // basic chain: exact → upper region code if present → GLOBAL
  const chain: string[] = [];
  if (region) chain.push(region);
  if (region && region.includes('-')) {
    chain.push(region.split('-')[0]);
  }
  chain.push('GLOBAL');
  return Array.from(new Set(chain));
}

export const GET = safeAsync(async (req: NextRequest) => {
  const regionParam = req.nextUrl.searchParams.get('region');
  const limit = Number(req.nextUrl.searchParams.get('limit') || '20');
  const regions = resolveRegionChain(regionParam || undefined);

  const polls = await prisma.publicPoll.findMany({
    where: {
      visibility: 'public',
      OR: [
        { region: { in: regions } },
        { region: null },
      ],
      OR_1: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ] as any,
    } as any,
    orderBy: { createdAt: 'desc' },
    take: Math.max(1, Math.min(50, limit)),
  });

  return NextResponse.json({ success: true, polls });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const creator = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!creator) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CreatePollSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid poll payload');
  }

  // Premium gating: freetext or targeted micro-polls (non-GLOBAL) costs premium currency if premiumCost > 0
  const requiresPremium = !!parsed.data.allowFreetext || !!(parsed.data.region && parsed.data.region !== 'GLOBAL');
  const cost = requiresPremium ? (parsed.data.premiumCost || 0) : 0;

  if (cost > 0 && creator.diamonds < cost) {
    return validationError('Insufficient diamonds for premium poll');
  }

  const poll = await prisma.$transaction(async (tx) => {
    const created = await tx.publicPoll.create({
      data: {
        title: parsed.data.title,
        question: parsed.data.question,
        options: parsed.data.options,
        region: parsed.data.region || 'GLOBAL',
        visibility: parsed.data.visibility || 'public',
        creatorId: creator.id,
        allowFreetext: parsed.data.allowFreetext ?? false,
        premiumCost: cost,
        rewardXP: parsed.data.rewardXP ?? 50,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      },
    });

    if (cost > 0) {
      await tx.user.update({ where: { id: creator.id }, data: { diamonds: { decrement: cost } } });
    }

    return created;
  });

  return NextResponse.json({ success: true, poll }, { status: 201 });
});


