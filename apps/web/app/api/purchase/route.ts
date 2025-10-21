import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { logPurchase } from "@/lib/activity";
import { notify } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, funds: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    // Get item details
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Calculate price (same logic as shop API)
    let price = 0;
    const rarityPrices: Record<string, number> = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 500,
    };
    price = rarityPrices[item.rarity] || 10;
    if (item.power) price += item.power * 2;
    if (item.defense) price += item.defense * 3;

    // Check if user has enough funds
    const userFunds = Number(user.funds);
    if (userFunds < price) {
      return NextResponse.json(
        { error: "Insufficient funds", required: price, available: userFunds },
        { status: 400 }
      );
    }

    // Deduct funds
    await prisma.user.update({
      where: { id: user.id },
      data: { funds: { decrement: price } },
    });

    // Add item to inventory
    await prisma.inventoryItem.upsert({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: item.id,
        },
      },
      update: {
        quantity: { increment: 1 },
      },
      create: {
        userId: user.id,
        itemId: item.id,
        quantity: 1,
        equipped: false,
      },
    });

    // Log activity
    await logPurchase(user.id, item.name, price, "funds");

    // Create notification
    await notify(
      user.id,
      "purchase",
      `Purchased ${item.name}`,
      `Spent ${price} gold`
    );

    // Publish event
    await publishEvent("purchase:complete", {
      userId: user.id,
      itemId: item.id,
      itemName: item.name,
      price,
      newBalance: userFunds - price,
    });

    return NextResponse.json({
      success: true,
      item,
      price,
      newBalance: userFunds - price,
    });
  } catch (error) {
    console.error("[API] Error processing purchase:", error);
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
