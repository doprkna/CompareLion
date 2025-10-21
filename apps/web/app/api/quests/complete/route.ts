import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { completeQuest } from "@/lib/quests";

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
    const { questId } = body;

    if (!questId) {
      return NextResponse.json({ error: "questId required" }, { status: 400 });
    }

    const result = await completeQuest(user.id, questId);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("[API] Error completing quest:", error);
    return NextResponse.json({ error: error.message || "Failed to complete quest" }, { status: 500 });
  }
}











