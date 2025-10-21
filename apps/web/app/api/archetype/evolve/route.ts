import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { checkAndEvolveArchetype } from "@/lib/archetype";

/**
 * POST /api/archetype/evolve
 * Check and trigger archetype evolution for current user
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

    // Check and evolve
    const result = await checkAndEvolveArchetype(user.id);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[API] Error checking archetype evolution:", error);
    return NextResponse.json(
      { error: "Failed to check archetype evolution" },
      { status: 500 }
    );
  }
}











