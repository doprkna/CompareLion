import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/wallet/transactions
 * Returns paginated wallet transactions for current user
 * Query params: ?page=1&limit=20
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
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  // Get total count for pagination
  const totalCount = await prisma.transaction.count({
    where: { userId: user.id },
  });

  // Get paginated transactions
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
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

  const hasMore = page * limit < totalCount;

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
    page,
    limit,
    totalCount,
    hasMore,
  });
});

