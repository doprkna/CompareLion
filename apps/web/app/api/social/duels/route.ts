import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/social/duels
 * Returns user's duels (active and past)
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

  // Get all duels where user is challenger or opponent
  const duels = await prisma.socialDuel.findMany({
    where: {
      OR: [
        { challengerId: user.id },
        { opponentId: user.id },
      ],
    },
    include: {
      challenger: {
        select: {
          id: true,
          username: true,
          level: true,
        },
      },
      opponent: {
        select: {
          id: true,
          username: true,
          level: true,
        },
      },
      winner: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return successResponse({
    success: true,
    duels,
    count: duels.length,
  });
});




