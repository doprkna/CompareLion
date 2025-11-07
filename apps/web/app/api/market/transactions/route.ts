import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/market/transactions
 * Returns last N transactions for current user
 */
export const GET = safeAsync(async (req: NextRequest) => {
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

  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "3", 10);

  // Get recent transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      itemId: true,
      type: true,
      amount: true,
      currencyKey: true,
      note: true,
      createdAt: true,
    },
  });

  return successResponse({
    success: true,
    transactions: transactions.map((t) => ({
      id: t.id,
      userId: t.userId,
      itemId: t.itemId,
      type: t.type,
      amount: t.amount.toNumber(),
      currencyKey: t.currencyKey,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
    })),
    count: transactions.length,
  });
});

