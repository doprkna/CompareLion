import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";

export async function GET() {
  try {
    ensurePrismaClient();
    
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

    // Fetch user's inventory with item details
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { userId: user.id },
      include: {
        item: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      items: inventoryItems,
      count: inventoryItems.length,
    });
  } catch (error) {
    console.error("[API Error][inventory]", error);
    
    return handleApiError(error, "Failed to fetch inventory");
  }
}



