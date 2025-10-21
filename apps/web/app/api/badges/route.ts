import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";

/**
 * GET /api/badges
 * Get user's unlocked badges/achievements
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userAchievements: {
          include: {
            achievement: true,
          },
          orderBy: {
            earnedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get pending animations (not shown yet)
    const pendingAnimations = user.userAchievements.filter(
      (ua) => !ua.animationShownAt
    );

    return NextResponse.json({
      success: true,
      badges: user.userAchievements.map((ua) => ({
        id: ua.id,
        achievementId: ua.achievementId,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon || "🏆",
        xpReward: ua.achievement.xpReward,
        earnedAt: ua.earnedAt,
        needsAnimation: !ua.animationShownAt,
      })),
      pendingAnimations: pendingAnimations.map((ua) => ({
        id: ua.id,
        achievementId: ua.achievementId,
        title: ua.achievement.title,
        description: ua.achievement.description,
        icon: ua.achievement.icon || "🏆",
        xpReward: ua.achievement.xpReward,
      })),
    });
  } catch (error) {
    console.error("[API] Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/badges
 * Unlock/award a badge to the user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { achievementCode } = body;

    if (!achievementCode) {
      return NextResponse.json(
        { error: "achievementCode required" },
        { status: 400 }
      );
    }

    // Find achievement by code
    const achievement = await prisma.achievement.findUnique({
      where: { code: achievementCode },
    });

    if (!achievement) {
      return NextResponse.json(
        { error: "Achievement not found" },
        { status: 404 }
      );
    }

    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: user.id,
          achievementId: achievement.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Achievement already unlocked" },
        { status: 400 }
      );
    }

    // Award achievement
    const userAchievement = await prisma.userAchievement.create({
      data: {
        userId: user.id,
        achievementId: achievement.id,
        // animationShownAt is null by default, will be set when animation plays
      },
    });

    // Award XP
    if (achievement.xpReward && achievement.xpReward > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          xp: { increment: achievement.xpReward },
        },
      });
    }

    // Send notification
    await notify(
      user.id,
      "badge_unlock",
      `Achievement Unlocked: ${achievement.title}`,
      achievement.description
    );

    // Publish real-time event
    await publishEvent("badge:unlock", {
      userId: user.id,
      userName: user.name || user.email,
      achievementId: achievement.id,
      title: achievement.title,
      icon: achievement.icon || "🏆",
      xpReward: achievement.xpReward,
    });

    return NextResponse.json({
      success: true,
      message: "Achievement unlocked!",
      achievement: {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon || "🏆",
        xpReward: achievement.xpReward,
      },
    });
  } catch (error) {
    console.error("[API] Error unlocking badge:", error);
    return NextResponse.json(
      { error: "Failed to unlock badge" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/badges
 * Mark badge animation as shown
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { userAchievementId } = body;

    if (!userAchievementId) {
      return NextResponse.json(
        { error: "userAchievementId required" },
        { status: 400 }
      );
    }

    // Mark animation as shown
    await prisma.userAchievement.update({
      where: { id: userAchievementId },
      data: {
        animationShownAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Animation marked as shown",
    });
  } catch (error) {
    console.error("[API] Error updating badge animation status:", error);
    return NextResponse.json(
      { error: "Failed to update animation status" },
      { status: 500 }
    );
  }
}
