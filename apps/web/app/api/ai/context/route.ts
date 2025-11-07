import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, validationError, unauthorizedError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { getAIContext, validateAIContextInput, invalidateAIContext } from '@/lib/ai/context';
import { requireAuth } from '@/lib/auth';

export const GET = safeAsync(async (req: NextRequest) => {
  const region = req.nextUrl.searchParams.get('region') || undefined;
  const locale = req.nextUrl.searchParams.get('locale') || undefined;

  const ctx = await getAIContext(region || locale || undefined);
  const payload = {
    success: true,
    context: ctx,
    timestamp: new Date().toISOString(),
  };
  const res = NextResponse.json(payload);
  res.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=86400');
  return res;
});

export const POST = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const body = await req.json();
  const { region, localeCode, toneProfile, culturalNotes, humorStyle, tabooTopics } = body || {};

  if (!region || !localeCode) {
    return validationError('region and localeCode are required');
  }

  const validation = validateAIContextInput({ toneProfile, culturalNotes, humorStyle });
  if (!validation.valid) {
    return validationError('Invalid input', validation.errors);
  }

  // Upsert by (region, localeCode) without unique constraint
  const existing = await prisma.aIRegionalContext.findFirst({ where: { region, localeCode } });
  let saved;
  if (existing) {
    saved = await prisma.aIRegionalContext.update({
      where: { id: existing.id },
      data: { toneProfile, culturalNotes, humorStyle, tabooTopics },
    });
  } else {
    saved = await prisma.aIRegionalContext.create({
      data: { region, localeCode, toneProfile, culturalNotes, humorStyle, tabooTopics },
    });
  }

  await invalidateAIContext(region);

  return NextResponse.json({ success: true, context: saved, timestamp: new Date().toISOString() }, { status: 201 });
});


