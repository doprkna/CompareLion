import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const BuyItemSchema = z.object({
  itemId: z.string().min(1),
});

/**
 * POST /api/market/buy
 * Validates funds, deducts, logs transaction
 * All operations atomic (transaction)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = BuyItemSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { itemId } = parsed.data;

  // Get market item
  const item = await prisma.marketItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return notFoundError("Item not found");
  }

  // Check stock (if limited)
  if (item.stock !== null && item.stock <= 0) {
    return validationError("Item out of stock");
  }

  // Get or create user wallet for currency
  let userWallet = await prisma.userWallet.findUnique({
    where: {
      userId_currencyKey: {
        userId: user.id,
        currencyKey: item.currencyKey,
      },
    },
  });

  if (!userWallet) {
    // Create wallet with zero balance
    userWallet = await prisma.userWallet.create({
      data: {
        userId: user.id,
        currencyKey: item.currencyKey,
        balance: 0,
      },
    });
  }

  // Check sufficient funds
  if (userWallet.balance.toNumber() < item.price.toNumber()) {
    return validationError(`Insufficient ${item.currencyKey} — need ${item.price.toNumber()}, have ${userWallet.balance.toNumber()}`);
  }

  // Perform purchase in transaction
  await prisma.$transaction(async (tx) => {
    // Deduct balance
    await tx.userWallet.update({
      where: {
        userId_currencyKey: {
          userId: user.id,
          currencyKey: item.currencyKey,
        },
      },
      data: {
        balance: {
          decrement: item.price,
        },
      },
    });

    // Decrement stock if limited
    if (item.stock !== null) {
      await tx.marketItem.update({
        where: { id: itemId },
        data: {
          stock: {
            decrement: 1,
          },
        },
      });
    }

    // Log transaction
    await tx.transaction.create({
      data: {
        userId: user.id,
        itemId: item.id,
        type: "purchase",
        amount: item.price,
        currencyKey: item.currencyKey,
        note: `Purchased ${item.name}`,
      },
    });
  });

  return successResponse({
    success: true,
    message: "Purchase complete",
    item: {
      id: item.id,
      name: item.name,
      category: item.category,
    },
    remainingBalance: userWallet.balance.toNumber() - item.price.toNumber(),
  });
});
