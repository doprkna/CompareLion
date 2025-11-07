import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const StartSharedMissionSchema = z.object({
  missionKey: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(2).max(4),
});

/**
 * POST /api/social/shared-missions/start
 * Creates a small co-op challenge (up to 4 players)
 * Limit: 2 concurrent shared missions per user
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
  const parsed = StartSharedMissionSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { missionKey, participantIds } = parsed.data;

  // Ensure current user is in participants
  if (!participantIds.includes(user.id)) {
    return validationError("Current user must be a participant");
  }

  // Verify all participants exist
  const participants = await prisma.user.findMany({
    where: {
      id: { in: participantIds },
    },
    select: { id: true },
  });

  if (participants.length !== participantIds.length) {
    return validationError("Some participants not found");
  }

  // Check concurrent mission limit (2 per user)
  const userActiveMissions = await prisma.sharedMission.count({
    where: {
      participants: { has: user.id },
      status: "active",
    },
  });

  if (userActiveMissions >= 2) {
    return validationError("Maximum 2 concurrent shared missions allowed");
  }

  // Calculate shared reward XP (base * participant count)
  const baseReward = 100;
  const rewardXP = baseReward * participantIds.length;

  // Create shared mission
  const mission = await prisma.sharedMission.create({
    data: {
      missionKey,
      participants: participantIds,
      status: "active",
      rewardXP,
    },
  });

  return successResponse({
    success: true,
    message: "Shared mission started",
    mission: {
      id: mission.id,
      missionKey: mission.missionKey,
      participants: mission.participants,
      rewardXP: mission.rewardXP,
      status: mission.status,
    },
  });
});




