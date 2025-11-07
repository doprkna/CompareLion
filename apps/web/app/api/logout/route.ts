import { NextRequest, NextResponse } from 'next/server';
import { safeAsync } from '@/lib/api-handler';

export const POST = safeAsync(async (_req: NextRequest) => {
  const response = NextResponse.json({ success: true, message: 'Logged out.', timestamp: new Date().toISOString() });
  response.headers.set(
    'Set-Cookie',
    'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure'
  );
  return response;
});
