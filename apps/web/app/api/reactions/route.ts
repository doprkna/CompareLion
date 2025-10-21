import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";

const VALID_EMOJIS = ["🔥", "🤯", "💬", "😬", "❤️", "👍", "🎉"];

/**
 * POST /api/reactions - Add or toggle reaction
 */
export async function POST(req: NextRequest) {
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

    const { targetType, targetId, emoji } = await req.json();

    if (!targetType || !targetId || !emoji) {
      return NextResponse.json(
        { error: "targetType, targetId, and emoji required" },
        { status: 400 }
      );
    }

    if (!VALID_EMOJIS.includes(emoji)) {
      return NextResponse.json(
        { error: "Invalid emoji" },
        { status: 400 }
      );
    }

    // Check if reaction already exists
    const existing = await prisma.reaction.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType,
          targetId,
        },
      },
    });

    if (existing) {
      // Toggle: remove if same emoji, update if different
      if (existing.emoji === emoji) {
        await prisma.reaction.delete({ where: { id: existing.id } });
        
        await publishEvent("reaction:remove", {
          userId: user.id,
          targetType,
          targetId,
          emoji,
        });

        return NextResponse.json({
          success: true,
          action: "removed",
        });
      } else {
        const updated = await prisma.reaction.update({
          where: { id: existing.id },
          data: { emoji },
        });

        await publishEvent("reaction:update", {
          userId: user.id,
          targetType,
          targetId,
          emoji,
        });

        return NextResponse.json({
          success: true,
          action: "updated",
          reaction: updated,
        });
      }
    }

    // Create new reaction
    const reaction = await prisma.reaction.create({
      data: {
        userId: user.id,
        targetType,
        targetId,
        emoji,
      },
    });

    await publishEvent("reaction:add", {
      userId: user.id,
      targetType,
      targetId,
      emoji,
    });

    return NextResponse.json({
      success: true,
      action: "added",
      reaction,
    });
  } catch (error) {
    console.error("[API] Error managing reaction:", error);
    return NextResponse.json(
      { error: "Failed to process reaction" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reactions?targetType=activity&targetId=123
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId required" },
        { status: 400 }
      );
    }

    const reactions = await prisma.reaction.findMany({
      where: { targetType, targetId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Group by emoji
    const grouped: Record<string, any[]> = {};
    reactions.forEach(r => {
      if (!grouped[r.emoji]) grouped[r.emoji] = [];
      grouped[r.emoji].push({
        userId: r.user.id,
        userName: r.user.name || r.user.email.split('@')[0],
      });
    });

    return NextResponse.json({
      success: true,
      reactions: grouped,
      total: reactions.length,
    });
  } catch (error) {
    console.error("[API] Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 }
    );
  }
}










