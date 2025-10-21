import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { updateUserScores } from "@/lib/scores";

/**
 * POST /api/score/update - Recalculate user scores
 * Can be called manually or triggered by other APIs
 */
export async function POST() {
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

    const scores = await updateUserScores(user.id);

    return NextResponse.json({
      success: true,
      scores,
    });
  } catch (error) {
    console.error("[API] Error updating scores:", error);
    return NextResponse.json(
      { error: "Failed to update scores" },
      { status: 500 }
    );
  }
}

