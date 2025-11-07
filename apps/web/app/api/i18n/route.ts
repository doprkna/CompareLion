import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { getCachedPack, loadPack } from '@/lib/i18n/packLoader';

// GET /api/i18n?lang=cs
export const GET = safeAsync(async (req: NextRequest) => {
  const url = new URL(req.url);
  const lang = (url.searchParams.get('lang') || 'en').toLowerCase();

  const cached = getCachedPack(lang) || (await loadPack(lang));
  const etag = cached.etag;

  const ifNoneMatch = req.headers.get('if-none-match');
  if (ifNoneMatch && ifNoneMatch === etag) {
    return new NextResponse(null, { status: 304 });
  }

  const res = NextResponse.json({ success: true, lang, pack: cached.pack, etag, timestamp: new Date().toISOString() });
  res.headers.set('ETag', etag);
  res.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=1800');
  return res;
});


