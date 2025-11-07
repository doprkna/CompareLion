import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const postcards = await prisma.postcard.findMany({
    where: {
      receiverId: user.id,
      status: { in: ['delivered', 'read'] },
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    postcards: postcards.map((p) => ({
      id: p.id,
      message: p.message,
      status: p.status,
      deliveryAt: p.deliveryAt,
      createdAt: p.createdAt,
      sender: p.sender,
    })),
  });
});

