import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { purchaseItem, cancelListing } from "@/lib/marketplace";

/**
 * PATCH /api/market/buy/[id]
 * Purchase item from marketplace
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const listingId = params.id;

    const result = await purchaseItem(listingId, user.id);

    return NextResponse.json({
      success: true,
      result,
      message: "Purchase successful!",
    });
  } catch (error: any) {
    console.error("[API] Error purchasing item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purchase item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/market/buy/[id]
 * Cancel own listing
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const listingId = params.id;

    await cancelListing(listingId, user.id);

    return NextResponse.json({
      success: true,
      message: "Listing cancelled",
    });
  } catch (error: any) {
    console.error("[API] Error cancelling listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel listing" },
      { status: 500 }
    );
  }
}











