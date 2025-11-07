import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, successResponse } from "@/lib/api-handler";

/**
 * GET /api/economy/summary
 * Returns aggregated economy statistics
 * Aggregates from UserWallet, Transaction, MarketItem
 * Query params: ?withTrends=true - Include 7-day trend data
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const withTrends = searchParams.get("withTrends") === "true";

  // Run all aggregation queries in parallel for better performance
  const [
    totalUsers,
    allWallets,
    allTransactions,
    allMarketItems,
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
    // Get purchase transactions for trending items
    prisma.transaction.findMany({
      where: {
        type: "purchase",
      },
      select: {
        itemId: true,
      },
    }),
    // Get all market items for name lookup
    prisma.marketItem.findMany({
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  // Calculate total gold and diamonds
  let totalGold = 0;
  let totalDiamonds = 0;
  let goldWalletCount = 0;
  let diamondsWalletCount = 0;

  allWallets.forEach((wallet) => {
    const balance = wallet.balance.toNumber();
    if (wallet.currencyKey === "gold") {
      totalGold += balance;
      if (balance > 0) goldWalletCount++;
    } else if (wallet.currencyKey === "diamonds") {
      totalDiamonds += balance;
      if (balance > 0) diamondsWalletCount++;
    }
  });

  // Calculate averages
  const avgGoldPerUser = totalUsers > 0 ? totalGold / totalUsers : 0;
  const avgDiamondsPerUser = totalUsers > 0 ? totalDiamonds / totalUsers : 0;

  // Calculate trending items (top 5 by purchase count)
  const itemPurchaseCounts = new Map<string, number>();
  allTransactions.forEach((tx) => {
    if (tx.itemId) {
      itemPurchaseCounts.set(tx.itemId, (itemPurchaseCounts.get(tx.itemId) || 0) + 1);
    }
  });

  // Get top 5 items by sales
  const trendingItems = Array.from(itemPurchaseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([itemId, sales]) => {
      const item = allMarketItems.find((m) => m.id === itemId);
      return {
        name: item?.name || "Unknown Item",
        sales,
      };
    });

  // Calculate 7-day trends if requested
  let trends = null;
  if (withTrends) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get dates for last 7 days
    const dates: Date[] = [];
    const timestamps: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date);
      timestamps.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
    }

    // Get all transactions from last 7 days for trend calculation
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        amount: true,
        currencyKey: true,
        createdAt: true,
        type: true,
      },
    });

    // Calculate cumulative net change from transactions
    // For each day, calculate what the balance would have been by working backwards
    const goldTrend: number[] = [];
    const diamondsTrend: number[] = [];

    dates.forEach((date, index) => {
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      // Calculate net change up to this day
      let goldNetChange = 0;
      let diamondsNetChange = 0;

      recentTransactions.forEach((tx) => {
        const txDate = new Date(tx.createdAt);
        if (txDate <= dayEnd) {
          const amount = tx.amount.toNumber();
          if (tx.currencyKey === "gold") {
            if (tx.type === "reward" || tx.type === "gift") {
              goldNetChange += amount;
            } else if (tx.type === "purchase") {
              goldNetChange -= Math.abs(amount);
            }
          } else if (tx.currencyKey === "diamonds") {
            if (tx.type === "reward" || tx.type === "gift") {
              diamondsNetChange += amount;
            } else if (tx.type === "purchase") {
              diamondsNetChange -= Math.abs(amount);
            }
          }
        }
      });

      // Calculate balance at end of this day by subtracting future transactions
      let goldDayBalance = totalGold;
      let diamondsDayBalance = totalDiamonds;

      // Subtract transactions that happened after this day
      recentTransactions.forEach((tx) => {
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
    trends = {
      gold: goldTrend,
      diamonds: diamondsTrend,
      timestamp: timestamps,
    };
  }

  return successResponse({
    success: true,
    totalGold,
    totalDiamonds,
    avgGoldPerUser,
    avgDiamondsPerUser,
    trendingItems,
    totalUsers,
    timestamp: new Date().toISOString(),
    ...(trends && { trends }),
  });
});

