import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, validationError } from '@/lib/api-handler';

// Optional: try prisma if available
async function trySaveSuggestion(data: { lang: string; key: string; suggested: string; userId?: string }) {
  try {
    const mod = await import('@/lib/db');
    const prisma = (mod as any).prisma as any;
    // If model exists, create; wrap in try/catch
    await prisma.translationSuggestion.create({
      data: {
        lang: data.lang,
        key: data.key,
        suggestedText: data.suggested,
        userId: data.userId || null,
        votes: 0,
        status: 'PENDING',
      },
    });
    return { stored: true };
  } catch {
    return { stored: false };
  }
}

// POST /api/i18n/suggest
export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { lang, key, suggested } = body || {};
  if (!lang || !key || !suggested) return validationError('Missing required fields: lang, key, suggested');

  const result = await trySaveSuggestion({ lang, key, suggested });
  const res = NextResponse.json({ success: true, accepted: true, stored: result.stored, timestamp: new Date().toISOString() });
  res.headers.set('Cache-Control', 'no-store');
  return res;
});


