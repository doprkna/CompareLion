import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { performCrafting } from "@/lib/crafting";
import { notify } from "@/lib/notify";

/**
 * POST /api/crafting/perform
 * Attempt to craft an item
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
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: "recipeId required" },
        { status: 400 }
      );
    }

    // Perform crafting
    const result = await performCrafting(user.id, recipeId);

    // Send notification
    if (result.success) {
      await notify(
        user.id,
        "crafting_success",
        "Crafting Successful!",
        `You crafted ${result.outputItem?.name} (${result.rarityAchieved})`
      );
    } else {
      await notify(
        user.id,
        "crafting_failed",
        "Crafting Failed",
        "Materials were lost in the attempt"
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("[API] Error performing crafting:", error);
    return NextResponse.json(
      { error: "Failed to perform crafting" },
      { status: 500 }
    );
  }
}










