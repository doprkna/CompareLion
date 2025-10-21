import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";

/**
 * GET /api/duels - List active and pending duels
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

    // Get duels where user is involved
    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { initiatorId: user.id },
          { receiverId: user.id },
        ],
        status: { in: ["pending", "active", "completed"] },
      },
      include: {
        initiator: {
          select: { id: true, name: true, email: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      duels,
    });
  } catch (error) {
    console.error("[API] Error fetching duels:", error);
    return NextResponse.json(
      { error: "Failed to fetch duels" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/duels - Challenge a friend to a duel
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

    const { friendId, categoryId } = await req.json();

    if (!friendId) {
      return NextResponse.json({ error: "friendId required" }, { status: 400 });
    }

    const friend = await prisma.user.findUnique({
      where: { id: friendId },
      select: { id: true, name: true, email: true },
    });

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Create duel
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const duel = await prisma.duel.create({
      data: {
        initiatorId: user.id,
        receiverId: friend.id,
        categoryId: categoryId || null,
        status: "pending",
        expiresAt,
      },
    });

    // Notify opponent
    await notify(
      friend.id,
      "system",
      "Duel Challenge!",
      `${user.email} has challenged you to a duel! 🗡️`
    );

    // Broadcast event
    await publishEvent("duel:challenge", {
      initiatorId: user.id,
      receiverId: friend.id,
      duelId: duel.id,
    });

    return NextResponse.json({
      success: true,
      duel,
    });
  } catch (error) {
    console.error("[API] Error creating duel:", error);
    return NextResponse.json(
      { error: "Failed to create duel" },
      { status: 500 }
    );
  }
}










