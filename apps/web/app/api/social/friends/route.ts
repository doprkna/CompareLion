import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/social/friends
 * Returns user's friends list with status + archetype info
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  // Get all friendships where user is either userA or userB and status is accepted
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userA: user.id },
        { userB: user.id },
      ],
      status: "accepted",
    },
    include: {
      userAProfile: {
        select: {
          id: true,
          username: true,
          name: true,
          archetype: true,
          level: true,
        },
      },
      userBProfile: {
        select: {
          id: true,
          username: true,
          name: true,
          archetype: true,
          level: true,
        },
      },
    },
  });

  // Map friendships to friend list
  const friends = friendships.map((friendship) => {
    // Determine which user is the friend (not the current user)
    const friend = friendship.userA === user.id 
      ? friendship.userBProfile 
      : friendship.userAProfile;

    return {
      id: friend.id,
      username: friend.username,
      name: friend.name,
      archetype: friend.archetype,
      level: friend.level,
      avatar: null, // Avatar can be added later from UserAvatar
      friendshipId: friendship.id,
      since: friendship.createdAt,
    };
  });

  return successResponse({
    success: true,
    friends,
    count: friends.length,
  });
});

