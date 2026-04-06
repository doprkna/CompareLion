/**
 * GET /api/test-logout
 * REVIEW_MODE only. Clears NextAuth session cookie.
 */
import { NextResponse } from 'next/server';
import { isReviewMode } from '@/lib/reviewMode';

export async function GET() {
  if (!isReviewMode()) {
    return new NextResponse(null, { status: 404 });
  }

  const isSecure = process.env.NEXTAUTH_URL?.startsWith('https') ?? !!process.env.VERCEL;
  const cookieName = isSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const res = new NextResponse(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  res.cookies.set(cookieName, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 0,
  });

  return res;
}
