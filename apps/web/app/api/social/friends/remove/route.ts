import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const RemoveFriendSchema = z.object({
  friendshipId: z.string().min(1),
});

/**
 * POST /api/social/friends/remove
 * Delete friendship
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
  const parsed = RemoveFriendSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { friendshipId } = parsed.data;

  // Get friendship and verify ownership
  const friendship = await prisma.friendship.findUnique({
    where: { id: friendshipId },
  });

  if (!friendship) {
    return notFoundError("Friendship not found");
  }

  // Verify user is part of this friendship
  if (friendship.userA !== user.id && friendship.userB !== user.id) {
    return validationError("Not authorized to remove this friendship");
  }

  // Delete friendship
  await prisma.friendship.delete({
    where: { id: friendshipId },
  });

  return successResponse({
    success: true,
    message: "Friendship removed",
  });
});




