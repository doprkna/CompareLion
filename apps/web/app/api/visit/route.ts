/**
 * POST /api/visit — Log one app visit per browser session (client uses sessionStorage).
 * v0.48.02
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getServerSession(authOptions);
  let userId: string | null = null;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id ?? null;
  }

  await prisma.appVisit.create({
    data: { userId },
  });

  return NextResponse.json({ success: true });
}
