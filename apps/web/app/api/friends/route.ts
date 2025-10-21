import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";

/**
 * GET /api/friends - List friends and requests
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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

    return NextResponse.json({
      success: true,
      friends: friendsList,
      requests: requests.map(r => ({
        id: r.id,
        from: r.user,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("[API] Error fetching friends:", error);
    return NextResponse.json(
      { error: "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/friends - Send friend request or accept
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { action, friendEmail, requestId } = await req.json();

    // Action: send request
    if (action === "send") {
      if (!friendEmail) {
        return NextResponse.json({ error: "friendEmail required" }, { status: 400 });
      }

      const friend = await prisma.user.findUnique({
        where: { email: friendEmail },
        select: { id: true, name: true, email: true },
      });

      if (!friend) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (friend.id === user.id) {
        return NextResponse.json({ error: "Cannot friend yourself" }, { status: 400 });
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
        return NextResponse.json({ error: "Request already exists" }, { status: 400 });
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

      return NextResponse.json({
        success: true,
        request: friendRequest,
      });
    }

    // Action: accept request
    if (action === "accept") {
      if (!requestId) {
        return NextResponse.json({ error: "requestId required" }, { status: 400 });
      }

      const request = await prisma.friend.findUnique({
        where: { id: requestId },
        include: {
          user: { select: { id: true, email: true } },
        },
      });

      if (!request || request.friendId !== user.id) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
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

      return NextResponse.json({
        success: true,
        friendship: updated,
      });
    }

    // Action: reject request
    if (action === "reject") {
      if (!requestId) {
        return NextResponse.json({ error: "requestId required" }, { status: 400 });
      }

      await prisma.friend.update({
        where: { id: requestId },
        data: { status: "rejected" },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[API] Error managing friends:", error);
    return NextResponse.json(
      { error: "Failed to process friend request" },
      { status: 500 }
    );
  }
}











