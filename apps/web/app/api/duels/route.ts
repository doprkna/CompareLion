import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from "@/lib/api-handler";

/**
 * GET /api/duels - List active and pending duels
 */
export const GET = safeAsync(async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

    // Get duels where user is involved
    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { initiatorId: user.id },
          { receiverId: user.id },
        ],
        status: { in: ["pending", "active", "completed"] },
      },
      include: {
        initiator: {
          select: { id: true, name: true, email: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return successResponse({ duels });
});

/**
 * POST /api/duels - Challenge a friend to a duel
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  const { friendId, categoryId } = await req.json();

  if (!friendId) {
    return validationError('friendId required');
  }

  const friend = await prisma.user.findUnique({
    where: { id: friendId },
    select: { id: true, name: true, email: true },
  });

  if (!friend) {
    return notFoundError('Friend');
  }

    // Create duel
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const duel = await prisma.duel.create({
      data: {
        initiatorId: user.id,
        receiverId: friend.id,
        categoryId: categoryId || null,
        status: "pending",
        expiresAt,
      },
    });

    // Notify opponent
    await notify(
      friend.id,
      "system",
      "Duel Challenge!",
      `${user.email} has challenged you to a duel! 🗡️`
    );

  // Broadcast event
  await publishEvent("duel:challenge", {
    initiatorId: user.id,
    receiverId: friend.id,
    duelId: duel.id,
  });

  return successResponse({ duel });
});













