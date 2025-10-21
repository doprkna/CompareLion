import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { publishEvent } from "@/lib/realtime";

/**
 * Typing indicator endpoint
 * Broadcasts typing events to other users
 * No database persistence - ephemeral events only
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toUserId, isTyping } = await req.json();

    if (!toUserId) {
      return NextResponse.json(
        { error: "toUserId required" },
        { status: 400 }
      );
    }

    // Broadcast typing event (lightweight, no DB)
    await publishEvent("typing", {
      fromEmail: session.user.email,
      fromUserId: session.user.id,
      toUserId,
      isTyping: isTyping !== false, // Default to true
      timestamp: Date.now(),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[API] Error broadcasting typing:", error);
    return NextResponse.json(
      { error: "Failed to broadcast typing" },
      { status: 500 }
    );
  }
}










