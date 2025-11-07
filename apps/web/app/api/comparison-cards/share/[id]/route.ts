import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, notFoundError } from '@/lib/api-handler';
import { renderSvgCard } from '@/lib/comparison/cardText';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const card = await prisma.comparisonCard.findUnique({ where: { id: ctx.params.id } });
  if (!card) return notFoundError('Not found');
  const bigNumber = `${Math.round((card as any).statsJson?.deltaPct || 0)}%`;
  const svg = renderSvgCard(card.funText, bigNumber);
  return new NextResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' } });
});


