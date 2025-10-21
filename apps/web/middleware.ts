import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';
import { 
  checkLoginRateLimit, 
  checkSignupRateLimit, 
  checkDailyLoginRateLimit 
} from '@/lib/security/rateLimit';
import { getRequestId, addRequestIdToResponse } from '@/lib/utils/requestId';

const PUBLIC_PATHS = ['/api/auth/signup', '/api/auth/login', '/api/ping'];
const COOKIE_NAME = 'session';
const SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const requestId = getRequestId(req);

  // Auth Routing: Redirect authenticated users from landing to main
  if (pathname === '/') {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (token) {
      return NextResponse.redirect(new URL('/main', req.url));
    }
  }

  // Rate limiting for auth endpoints
  if (pathname === '/api/auth/login') {
    // Check per-minute rate limit (5 requests/minute)
    const minuteLimit = await checkLoginRateLimit(req);
    if (!minuteLimit.allowed) {
      const response = new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Too many login attempts. Please try again later.',
          requestId
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': minuteLimit.retryAfter?.toString() || '60',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': minuteLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(minuteLimit.resetTime / 1000).toString(),
          }
        }
      );
      return addRequestIdToResponse(response, requestId);
    }

    // Check daily rate limit (50 requests/day)
    const dailyLimit = await checkDailyLoginRateLimit(req);
    if (!dailyLimit.allowed) {
      const response = new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Daily login limit exceeded. Please try again tomorrow.',
          requestId
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': dailyLimit.retryAfter?.toString() || '86400',
            'X-RateLimit-Limit': '50',
            'X-RateLimit-Remaining': dailyLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(dailyLimit.resetTime / 1000).toString(),
          }
        }
      );
      return addRequestIdToResponse(response, requestId);
    }
  }

  if (pathname === '/api/auth/signup') {
    // Check hourly rate limit (3 requests/hour)
    const hourlyLimit = await checkSignupRateLimit(req);
    if (!hourlyLimit.allowed) {
      const response = new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Too many signup attempts. Please try again later.',
          requestId
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': hourlyLimit.retryAfter?.toString() || '3600',
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': hourlyLimit.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(hourlyLimit.resetTime / 1000).toString(),
          }
        }
      );
      return addRequestIdToResponse(response, requestId);
    }
  }

  // Continue with authentication for protected paths
  if (PUBLIC_PATHS.includes(pathname)) {
    const response = NextResponse.next();
    return addRequestIdToResponse(response, requestId);
  }

  // Use NextAuth's getToken to get the session
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    // attach user info to request headers (available to API routes)
    const res = NextResponse.next();
    res.headers.set("x-user-id", String(token.sub || token.id))
    res.headers.set("x-user-email", String(token.email))
    return addRequestIdToResponse(res, requestId);
  }

  const response = NextResponse.next();
  return addRequestIdToResponse(response, requestId);
}

export const config = {
  matcher: ['/api/:path*', '/'],
};
