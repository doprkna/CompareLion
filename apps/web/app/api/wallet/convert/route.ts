import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const ConvertCurrencySchema = z.object({
  fromCurrency: z.string().min(1),
  toCurrency: z.string().min(1),
  amount: z.number().positive(),
});

/**
 * POST /api/wallet/convert
 * Exchange between currencies (admin-set rate)
 * For MVP, allows user conversions; future: admin-only
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
  const parsed = ConvertCurrencySchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { fromCurrency, toCurrency, amount } = parsed.data;

  // Cannot convert to same currency
  if (fromCurrency === toCurrency) {
    return validationError("Cannot convert to same currency");
  }

  // Get currencies
  const fromCurrencyData = await prisma.currency.findUnique({
    where: { key: fromCurrency },
  });

  const toCurrencyData = await prisma.currency.findUnique({
    where: { key: toCurrency },
  });

  if (!fromCurrencyData || !toCurrencyData) {
    return validationError("Invalid currency");
  }

  // Get or create source wallet
  let fromWallet = await prisma.userWallet.findUnique({
    where: {
      userId_currencyKey: {
        userId: user.id,
        currencyKey: fromCurrency,
      },
    },
  });

  if (!fromWallet) {
    fromWallet = await prisma.userWallet.create({
      data: {
        userId: user.id,
        currencyKey: fromCurrency,
        balance: 0,
      },
    });
  }

  // Check sufficient balance
  if (fromWallet.balance.toNumber() < amount) {
    return validationError(`Insufficient ${fromCurrency}`);
  }

  // Calculate converted amount using exchange rates
  // Convert from source to base (gold), then to target currency
  const baseAmount = amount / fromCurrencyData.exchangeRate;
  const convertedAmount = baseAmount * toCurrencyData.exchangeRate;

  // Get or create target wallet
  let toWallet = await prisma.userWallet.findUnique({
    where: {
      userId_currencyKey: {
        userId: user.id,
        currencyKey: toCurrency,
      },
    },
  });

  if (!toWallet) {
    toWallet = await prisma.userWallet.create({
      data: {
        userId: user.id,
        currencyKey: toCurrency,
        balance: 0,
      },
    });
  }

  // Perform conversion in transaction
  await prisma.$transaction(async (tx) => {
    // Deduct from source
    await tx.userWallet.update({
      where: {
        userId_currencyKey: {
          userId: user.id,
          currencyKey: fromCurrency,
        },
      },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    // Add to target
    await tx.userWallet.update({
      where: {
        userId_currencyKey: {
          userId: user.id,
          currencyKey: toCurrency,
        },
      },
      data: {
        balance: {
          increment: convertedAmount,
        },
      },
    });

    // Log transaction
    await tx.transaction.create({
      data: {
        userId: user.id,
        type: "purchase", // Using purchase type for conversion
        amount: amount,
        currencyKey: fromCurrency,
        note: `Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`,
      },
    });
  });

  return successResponse({
    success: true,
    message: "Currency converted",
    fromAmount: amount,
    toAmount: convertedAmount,
    fromCurrency,
    toCurrency,
  });
});




