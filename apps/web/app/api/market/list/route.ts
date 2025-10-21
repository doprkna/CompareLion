import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { createListing } from "@/lib/marketplace";

/**
 * POST /api/market/list
 * Create new market listing
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
    const { itemId, price, currency } = body;

    if (!itemId || !price) {
      return NextResponse.json(
        { error: "itemId and price required" },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 }
      );
    }

    const validCurrencies = ["gold", "diamonds"];
    if (currency && !validCurrencies.includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency" },
        { status: 400 }
      );
    }

    const listing = await createListing(
      user.id,
      itemId,
      price,
      currency || "gold"
    );

    return NextResponse.json({
      success: true,
      listing,
      message: "Item listed successfully",
    });
  } catch (error: any) {
    console.error("[API] Error creating listing:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create listing" },
      { status: 500 }
    );
  }
}










