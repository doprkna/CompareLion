import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const PUBLIC_PATHS = ['/api/auth/signup', '/api/auth/login', '/api/ping'];
const COOKIE_NAME = 'session';
const SECRET = process.env.JWT_SECRET || 'dev-secret';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Read JWT from 'session' cookie
  const token = req.cookies.get("session")?.value
  if (!token) return NextResponse.next()

  try {
    const decoded = jwt.verify(token, SECRET)
    // attach decoded user to request headers (available to API routes)
    const res = NextResponse.next()
    res.headers.set("x-user-id", String((decoded as any).sub))
    res.headers.set("x-user-email", String((decoded as any).email))
    return res
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
