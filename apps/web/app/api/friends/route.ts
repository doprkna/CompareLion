import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from "@/lib/api-handler";

/**
 * GET /api/friends - List friends and requests
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

    // Get accepted friends
    const friends = await prisma.friend.findMany({
      where: {
        OR: [
          { userId: user.id, status: "accepted" },
          { friendId: user.id, status: "accepted" },
        ],
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true, level: true, xp: true },
        },
        friend: {
          select: { id: true, name: true, email: true, image: true, level: true, xp: true },
        },
      },
    });

    // Get pending requests (received)
    const requests = await prisma.friend.findMany({
      where: {
        friendId: user.id,
        status: "pending",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    // Format friends list
  const friendsList = friends.map(f => {
    const friendData = f.userId === user.id ? f.friend : f.user;
    return {
      id: f.id,
      user: friendData,
      since: f.acceptedAt || f.createdAt,
    };
  });

  return successResponse({
    friends: friendsList,
    requests: requests.map(r => ({
      id: r.id,
      from: r.user,
      createdAt: r.createdAt,
    })),
  });
});

/**
 * POST /api/friends - Send friend request or accept
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

  const { action, friendEmail, requestId } = await req.json();

  // Action: send request
  if (action === "send") {
    if (!friendEmail) {
      return validationError('friendEmail required');
    }

    const friend = await prisma.user.findUnique({
      where: { email: friendEmail },
      select: { id: true, name: true, email: true },
    });

    if (!friend) {
      return notFoundError('User');
    }

    if (friend.id === user.id) {
      return validationError('Cannot friend yourself');
    }

    // Check if already friends or request exists
    const existing = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: user.id, friendId: friend.id },
          { userId: friend.id, friendId: user.id },
        ],
      },
    });

    if (existing) {
      return validationError('Request already exists');
    }

      // Create friend request
      const friendRequest = await prisma.friend.create({
        data: {
          userId: user.id,
          friendId: friend.id,
          status: "pending",
        },
      });

    // Notify recipient
    await notify(friend.id, "system", "Friend Request", `${user.email} sent you a friend request`);

    return successResponse({ request: friendRequest });
  }

  // Action: accept request
  if (action === "accept") {
    if (!requestId) {
      return validationError('requestId required');
    }

    const request = await prisma.friend.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, email: true } },
      },
    });

    if (!request || request.friendId !== user.id) {
      return notFoundError('Request');
    }

      // Update status to accepted
      const updated = await prisma.friend.update({
        where: { id: requestId },
        data: {
          status: "accepted",
          acceptedAt: new Date(),
        },
      });

      // Notify requester
      await notify(request.userId, "system", "Friend Request Accepted", `${user.email} accepted your friend request!`);

    // Broadcast event
    await publishEvent("friend:new", {
      userId: user.id,
      friendId: request.userId,
    });

    return successResponse({ friendship: updated });
  }

  // Action: reject request
  if (action === "reject") {
    if (!requestId) {
      return validationError('requestId required');
    }

    await prisma.friend.update({
      where: { id: requestId },
      data: { status: "rejected" },
    });

    return successResponse({});
  }

  return validationError('Invalid action');
});













