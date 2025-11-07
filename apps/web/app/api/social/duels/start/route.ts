import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const StartDuelSchema = z.object({
  opponentId: z.string().min(1),
  type: z.enum(["xp", "reflection", "random", "poll"]),
});

/**
 * POST /api/social/duels/start
 * Creates a new duel
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, level: true, xp: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = StartDuelSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { opponentId, type } = parsed.data;

  // Cannot duel yourself
  if (opponentId === user.id) {
    return validationError("Cannot duel yourself");
  }

  // Check if opponent exists
  const opponent = await prisma.user.findUnique({
    where: { id: opponentId },
    select: { id: true, level: true, xp: true },
  });

  if (!opponent) {
    return notFoundError("Opponent not found");
  }

  // Check for existing active duel between these users
  const existingDuel = await prisma.socialDuel.findFirst({
    where: {
      OR: [
        {
          challengerId: user.id,
          opponentId: opponentId,
          status: { in: ["pending", "active"] },
        },
        {
          challengerId: opponentId,
          opponentId: user.id,
          status: { in: ["pending", "active"] },
        },
      ],
    },
  });

  if (existingDuel) {
    return validationError("Active duel already exists with this user");
  }

  // Calculate reward XP based on levels
  const baseReward = Math.max(user.level, opponent.level) * 10;
  const rewardXP = Math.floor(baseReward * 1.5); // 1.5x base for duel incentive

  // Create duel
  const duel = await prisma.socialDuel.create({
    data: {
      challengerId: user.id,
      opponentId: opponentId,
      status: "pending",
      challengeType: type,
      rewardXP,
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
    },
  });

  return successResponse({
    success: true,
    message: "Duel created",
    duel: {
      id: duel.id,
      challenger: duel.challenger,
      opponent: duel.opponent,
      challengeType: duel.challengeType,
      rewardXP: duel.rewardXP,
      status: duel.status,
    },
  });
});

