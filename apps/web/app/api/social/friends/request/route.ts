import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const FriendRequestSchema = z.object({
  userId: z.string().min(1),
  action: z.enum(["send", "accept", "decline", "block"]),
});

/**
 * POST /api/social/friends/request
 * Send/accept friend request
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = FriendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { userId, action } = parsed.data;

  // Cannot friend yourself
  if (userId === user.id) {
    return validationError("Cannot friend yourself");
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!targetUser) {
    return notFoundError("User not found");
  }

  // Ensure consistent ordering (userA < userB alphabetically by ID)
  const [userA, userB] = [user.id, userId].sort();

  // Check if friendship already exists
  let friendship = await prisma.friendship.findUnique({
    where: {
      userA_userB: {
        userA,
        userB,
      },
    },
  });

  if (action === "send") {
    if (friendship) {
      return validationError("Friendship request already exists");
    }

    // Create pending friendship
    friendship = await prisma.friendship.create({
      data: {
        userA,
        userB,
        status: "pending",
      },
    });

    return successResponse({
      success: true,
      message: "Friend request sent",
      friendship: {
        id: friendship.id,
        status: friendship.status,
      },
    });
  }

  if (action === "accept") {
    if (!friendship || friendship.status !== "pending") {
      return validationError("No pending friend request found");
    }

    // Accept friendship
    friendship = await prisma.friendship.update({
      where: { id: friendship.id },
      data: {
        status: "accepted",
      },
    });

    return successResponse({
      success: true,
      message: "Friend request accepted",
      friendship: {
        id: friendship.id,
        status: friendship.status,
      },
    });
  }

  if (action === "decline") {
    if (!friendship) {
      return validationError("No friend request found");
    }

    // Delete friendship request
    await prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return successResponse({
      success: true,
      message: "Friend request declined",
    });
  }

  if (action === "block") {
    if (friendship) {
      // Update to blocked
      friendship = await prisma.friendship.update({
        where: { id: friendship.id },
        data: {
          status: "blocked",
        },
      });
    } else {
      // Create blocked friendship
      friendship = await prisma.friendship.create({
        data: {
          userA,
          userB,
          status: "blocked",
        },
      });
    }

    return successResponse({
      success: true,
      message: "User blocked",
      friendship: {
        id: friendship.id,
        status: friendship.status,
      },
    });
  }

  return validationError("Invalid action");
});




