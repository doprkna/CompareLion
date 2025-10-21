import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { getArchetypeHistory } from "@/lib/archetype";

/**
 * GET /api/archetype/history
 * Get user's archetype evolution history
 */
export async function GET(req: NextRequest) {
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

    const history = await getArchetypeHistory(user.id, 20);

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("[API] Error fetching archetype history:", error);
    return NextResponse.json(
      { error: "Failed to fetch archetype history" },
      { status: 500 }
    );
  }
}










