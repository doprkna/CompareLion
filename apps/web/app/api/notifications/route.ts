import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { handleApiError } from "@/lib/api-error-handler";

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

    // Fetch recent notifications (last 30)
    const items = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = items.filter(item => !item.isRead).length;

    return NextResponse.json({
      success: true,
      items,
      unreadCount,
    });
  } catch (error) {
    return handleApiError(error, "fetching notifications");
  }
}

export async function PATCH(req: NextRequest) {
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

    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: "ids array required" },
        { status: 400 }
      );
    }

    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        id: { in: ids },
      },
      data: { isRead: true },
    });

    return NextResponse.json({
      success: true,
      markedCount: ids.length,
    });
  } catch (error) {
    return handleApiError(error, "updating notifications");
  }
}



