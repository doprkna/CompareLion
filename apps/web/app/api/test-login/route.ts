/**
 * GET /api/test-login?user=demo
 * REVIEW_MODE only. Sets NextAuth session cookie for demo user.
 */
import { NextRequest } from 'next/server';
import { isReviewMode } from '@/lib/reviewMode';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

const DEMO_EMAIL = 'demo@example.com';

export async function GET(req: NextRequest) {
  if (!isReviewMode()) {
    return new Response(null, { status: 404 });
  }

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;
  if (!secret) {
    return Response.json(
      { error: 'NEXTAUTH_SECRET not set' },
      { status: 500 }
    );
  }

  const userParam = req.nextUrl.searchParams.get('user') ?? 'demo';
  if (userParam !== 'demo') {
    return Response.json({ error: 'Only user=demo supported' }, { status: 400 });
  }

  let user = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    select: { id: true, email: true, name: true, image: true, role: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: DEMO_EMAIL,
        name: 'Demo User',
        role: 'USER',
        birthYear: 1990,
      },
      select: { id: true, email: true, name: true, image: true, role: true },
    }).catch(async () => {
      const u = await prisma.user.findFirst({
        where: { role: 'USER' },
        select: { id: true, email: true, name: true, image: true, role: true },
      });
      return u ?? { id: 'demo', email: DEMO_EMAIL, name: 'Demo', image: null, role: 'USER' };
    }) as typeof user;
  }

  const token = await encode({
    token: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      isPremium: false,
      premiumUntil: null,
    },
    secret,
    maxAge: 60 * 60 * 24, // 24h
  });

  const isSecure = process.env.NEXTAUTH_URL?.startsWith('https') ?? !!process.env.VERCEL;
  const cookieName = isSecure
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  const res = new NextResponse(JSON.stringify({ ok: true, user: userParam }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  res.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return res;
}
