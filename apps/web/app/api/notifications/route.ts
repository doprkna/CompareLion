import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { safeAsync, authError, notFoundError } from "@/lib/api-handler";

export const GET = safeAsync(async (_req: NextRequest) => {
  ensurePrismaClient();
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Fetch recent notifications (last 30) - optimized with composite index (userId, isRead)
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Count unread using index-optimized query (v0.29.22)
  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return NextResponse.json({
    success: true,
    items,
    unreadCount,
  });
});

import { z } from "zod";

const MarkReadSchema = z.object({
  ids: z.array(z.string()).min(1)
});

export const PATCH = safeAsync(async (req: NextRequest) => {
  ensurePrismaClient();
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  const body = await req.json();
  const { ids } = MarkReadSchema.parse(body);

  // Mark notifications as read
  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      id: { in: ids },
    },
    data: { isRead: true },
  });

  return NextResponse.json({
    success: true,
    markedCount: ids.length,
  });
});



