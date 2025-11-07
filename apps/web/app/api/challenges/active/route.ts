import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

function regionChain(region?: string | null): string[] {
  const chain: string[] = [];
  if (region) chain.push(region);
  if (region && region.includes('-')) chain.push(region.split('-')[0]);
  chain.push('GLOBAL');
  return Array.from(new Set(chain));
}

export const GET = safeAsync(async (req: NextRequest) => {
  const region = req.nextUrl.searchParams.get('region');
  const regions = regionChain(region || undefined);
  const now = new Date();

  const list = await prisma.publicChallenge.findMany({
    where: {
      isActive: true,
      OR: [{ activeTo: null }, { activeTo: { gt: now } }],
      OR_1: [{ region: { in: regions } }, { region: null } ] as any,
    } as any,
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({ success: true, challenges: list });
});


