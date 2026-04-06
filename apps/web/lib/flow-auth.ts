/**
 * Flow API auth: session or dev-only smoke-key bypass.
 * Smoke bypass: APP_ENV=dev + x-smoke-key === SMOKE_KEY → authenticate as demo user.
 * Never allows bypass in production.
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

const DEMO_EMAILS = ['demo@example.com', 'demo+001@parel.app'];

export interface FlowUser {
  id: string;
  email: string;
}

/**
 * Returns FlowUser for flow routes, or null if unauthenticated.
 * In dev: accepts x-smoke-key header when SMOKE_KEY matches.
 */
export async function getFlowUser(req: NextRequest): Promise<FlowUser | null> {
  const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
  const isProd = appEnv === 'prod' || appEnv === 'production';

  if (!isProd) {
    const smokeKey = process.env.SMOKE_KEY?.trim();
    const headerKey = req.headers.get('x-smoke-key')?.trim();
    if (smokeKey && headerKey === smokeKey) {
      const { prisma } = await import('@/lib/db');
      for (const email of DEMO_EMAILS) {
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true },
        });
        if (user) return { id: user.id, email: user.email };
      }
    }
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });
  return user ? { id: user.id, email: user.email } : null;
}
