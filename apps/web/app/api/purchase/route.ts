import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { logPurchase } from "@/lib/activity";
import { notify } from "@/lib/notify";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from "@/lib/api-handler";

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, funds: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  const { itemId } = await req.json();

  if (!itemId) {
    return validationError('itemId required');
  }

  // Get item details
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return notFoundError('Item');
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
    return validationError(`Insufficient funds: need ${price}, have ${userFunds}`);
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

  return successResponse({
    item,
    price,
    newBalance: userFunds - price,
  });
});
