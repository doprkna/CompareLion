import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const CompleteDuelSchema = z.object({
  duelId: z.string().min(1),
  winnerId: z.string().min(1),
});

/**
 * POST /api/social/duels/complete
 * Updates winner/loser, grants XP
 * Winner gets +2% XP bonus, loser gets +1% karma ("humility bonus")
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, xp: true, karmaScore: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = CompleteDuelSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { duelId, winnerId } = parsed.data;

  // Get duel
  const duel = await prisma.socialDuel.findUnique({
    where: { id: duelId },
    include: {
      challenger: {
        select: { id: true, xp: true, karmaScore: true },
      },
      opponent: {
        select: { id: true, xp: true, karmaScore: true },
      },
    },
  });

  if (!duel) {
    return notFoundError("Duel not found");
  }

  // Verify user is part of the duel
  if (duel.challengerId !== user.id && duel.opponentId !== user.id) {
    return validationError("Not authorized to complete this duel");
  }

  // Verify winner is part of the duel
  if (winnerId !== duel.challengerId && winnerId !== duel.opponentId) {
    return validationError("Winner must be part of the duel");
  }

  // Verify duel is active
  if (duel.status !== "active" && duel.status !== "pending") {
    return validationError("Duel is not active");
  }

  const loserId = winnerId === duel.challengerId ? duel.opponentId : duel.challengerId;
  const winner = winnerId === duel.challengerId ? duel.challenger : duel.opponent;
  const loser = loserId === duel.challengerId ? duel.challenger : duel.opponent;

  // Calculate rewards
  const winnerXPBonus = Math.floor(winner.xp * 0.02); // +2% XP bonus
  const loserKarmaBonus = Math.max(1, Math.floor(loser.karmaScore * 0.01) || 10); // +1% karma or minimum 10

  // Update duel and grant rewards in transaction
  await prisma.$transaction(async (tx) => {
    // Mark duel as completed
    await tx.socialDuel.update({
      where: { id: duelId },
      data: {
        status: "completed",
        winnerId,
      },
    });

    // Grant winner XP bonus
    await tx.user.update({
      where: { id: winnerId },
      data: {
        xp: { increment: winnerXPBonus + duel.rewardXP },
      },
    });

    // Grant loser karma bonus
    await tx.user.update({
      where: { id: loserId },
      data: {
        karmaScore: { increment: loserKarmaBonus },
      },
    });
  });

  return successResponse({
    success: true,
    message: "Duel completed",
    results: {
      winner: {
        id: winnerId,
        xpGained: winnerXPBonus + duel.rewardXP,
      },
      loser: {
        id: loserId,
        karmaGained: loserKarmaBonus,
      },
    },
  });
});

