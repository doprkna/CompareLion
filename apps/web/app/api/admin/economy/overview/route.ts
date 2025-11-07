import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError } from "@/lib/api-handler";

/**
 * GET /api/admin/economy/overview
 * Returns aggregated economy dashboard data for admin
 * Combines: economy summary, trends, recent transactions, top items
 * Admin-only auth required
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "DEVOPS")) {
    return forbiddenError("Admin access required");
  }

  // Fetch all data in parallel
  const [
    totalUsers,
    allWallets,
    allTransactions,
    allMarketItems,
    recentTransactions,
    purchaseTransactions,
  ] = await Promise.all([
    // Count total users
    prisma.user.count(),
    // Get all wallet balances
    prisma.userWallet.findMany({
      select: {
        currencyKey: true,
        balance: true,
      },
    }),
    // Get all transactions (for trends)
    prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      select: {
        amount: true,
        currencyKey: true,
        createdAt: true,
        type: true,
      },
    }),
    // Get all market items
    prisma.marketItem.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
    // Get recent transactions (last 10)
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
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
    }),
    // Get purchase transactions for top items
    prisma.transaction.findMany({
      where: {
        type: "purchase",
      },
      select: {
        itemId: true,
      },
    }),
  ]);

  // Calculate totals
  let totalGold = 0;
  let totalDiamonds = 0;
  let totalKarma = 0;

  allWallets.forEach((wallet) => {
    const balance = wallet.balance.toNumber();
    if (wallet.currencyKey === "gold") {
      totalGold += balance;
    } else if (wallet.currencyKey === "diamonds") {
      totalDiamonds += balance;
    } else if (wallet.currencyKey === "karma") {
      totalKarma += balance;
    }
  });

  // Calculate averages
  const avgGoldPerUser = totalUsers > 0 ? totalGold / totalUsers : 0;
  const avgDiamondsPerUser = totalUsers > 0 ? totalDiamonds / totalUsers : 0;

  // Calculate trending items (top 5 by purchase count)
  const itemPurchaseCounts = new Map<string, number>();
  purchaseTransactions.forEach((tx) => {
    if (tx.itemId) {
      itemPurchaseCounts.set(tx.itemId, (itemPurchaseCounts.get(tx.itemId) || 0) + 1);
    }
  });

  const topItems = Array.from(itemPurchaseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([itemId, sales]) => {
      const item = allMarketItems.find((m) => m.id === itemId);
      return {
        id: itemId,
        name: item?.name || "Unknown Item",
        sales,
        changePercent: 0, // TODO: Calculate vs last week
      };
    });

  // Calculate 7-day trends
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  const timestamps: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
    timestamps.push(date.toISOString().split('T')[0]);
  }

  const goldTrend: number[] = [];
  const diamondsTrend: number[] = [];

  dates.forEach((date) => {
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    let goldDayBalance = totalGold;
    let diamondsDayBalance = totalDiamonds;

    // Subtract transactions that happened after this day
    allTransactions.forEach((tx) => {
      const txDate = new Date(tx.createdAt);
      if (txDate > dayEnd) {
        const amount = tx.amount.toNumber();
        if (tx.currencyKey === "gold") {
          if (tx.type === "reward" || tx.type === "gift") {
            goldDayBalance -= amount;
          } else if (tx.type === "purchase") {
            goldDayBalance += Math.abs(amount);
          }
        } else if (tx.currencyKey === "diamonds") {
          if (tx.type === "reward" || tx.type === "gift") {
            diamondsDayBalance -= amount;
          } else if (tx.type === "purchase") {
            diamondsDayBalance += Math.abs(amount);
          }
        }
      }
    });

    goldTrend.push(Math.max(0, goldDayBalance));
    diamondsTrend.push(Math.max(0, diamondsDayBalance));
  });

  // Format recent transactions
  const formattedTransactions = recentTransactions.map((t) => ({
    id: t.id,
    userId: t.userId,
    itemId: t.itemId,
    type: t.type,
    amount: t.amount.toNumber(),
    currencyKey: t.currencyKey,
    note: t.note,
    createdAt: t.createdAt.toISOString(),
  }));

  // Currency breakdown
  const totalCurrency = totalGold + totalDiamonds + totalKarma;
  const currencyBreakdown = {
    gold: totalCurrency > 0 ? (totalGold / totalCurrency) * 100 : 0,
    diamonds: totalCurrency > 0 ? (totalDiamonds / totalCurrency) * 100 : 0,
    karma: totalCurrency > 0 ? (totalKarma / totalCurrency) * 100 : 0,
  };

  return successResponse({
    success: true,
    summary: {
      totalGold,
      totalDiamonds,
      avgGoldPerUser,
      avgDiamondsPerUser,
      totalUsers,
      timestamp: new Date().toISOString(),
    },
    trends: {
      gold: goldTrend,
      diamonds: diamondsTrend,
      timestamp: timestamps,
    },
    topItems,
    transactions: formattedTransactions,
    currencyBreakdown,
  });
});

