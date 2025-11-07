import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/wallet
 * Returns current balances across all currencies
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

  // Get all user wallets
  const wallets = await prisma.userWallet.findMany({
    where: { userId: user.id },
    select: {
      currencyKey: true,
      balance: true,
      updatedAt: true,
    },
  });

  // Get all currencies for reference
  const currencies = await prisma.currency.findMany({
    select: {
      key: true,
      name: true,
      symbol: true,
      isPremium: true,
      exchangeRate: true,
    },
  });

  // Map wallets with currency info
  const walletData = currencies.map((currency) => {
    const wallet = wallets.find((w) => w.currencyKey === currency.key);
    return {
      currencyKey: currency.key,
      name: currency.name,
      symbol: currency.symbol,
      isPremium: currency.isPremium,
      exchangeRate: currency.exchangeRate,
      balance: wallet ? wallet.balance.toNumber() : 0,
      updatedAt: wallet?.updatedAt || null,
    };
  });

  return successResponse({
    success: true,
    wallets: walletData,
    currencies: currencies.length,
  });
});
