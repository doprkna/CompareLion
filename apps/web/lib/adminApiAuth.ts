/**
 * Require admin for API routes. Returns { ok, userId } or { ok: false, error: NextResponse }
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { unauthorizedError, forbiddenError } from '@/lib/api-handler';
import type { NextResponse } from 'next/server';

const ADMIN_ROLES = ['ADMIN'];

export async function requireAdminApi(): Promise<
  | { ok: true; userId: string }
  | { ok: false; error: NextResponse }
> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { ok: false, error: unauthorizedError() };
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || !ADMIN_ROLES.includes(user.role)) return { ok: false, error: forbiddenError() };
  return { ok: true, userId: user.id };
}
