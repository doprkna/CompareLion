import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { updateWalletWithLock } from "@/lib/utils/walletTransactions";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const ClaimBadgeSchema = z.object({
  userBadgeId: z.string().min(1),
});

/**
 * POST /api/badges/claim
 * Claim badge reward (grants reward, marks as claimed, updates wallet)
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
  const parsed = ClaimBadgeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { userBadgeId } = parsed.data;

  // Get user badge with badge details
  const userBadge = await prisma.userBadge.findUnique({
    where: { id: userBadgeId },
    include: {
      badge: true,
      user: {
        select: { id: true },
      },
    },
  });

  if (!userBadge) {
    return notFoundError("User badge not found");
  }

  // Verify ownership
  if (userBadge.userId !== user.id) {
    return validationError("Not authorized to claim this badge");
  }

  // Check if already claimed
  if (userBadge.isClaimed) {
    return validationError("Reward already claimed");
  }

  // Check if badge has a reward
  if (!userBadge.badge.rewardType) {
    return validationError("This badge has no reward to claim");
  }

  const badge = userBadge.badge;
  const rewardType = badge.rewardType;
  const rewardValue = badge.rewardValue;

  if (!rewardValue) {
    return validationError("Reward value missing");
  }

  // Claim the reward in a transaction
  await prisma.$transaction(async (tx) => {
    // Mark badge as claimed
    await tx.userBadge.update({
      where: { id: userBadgeId },
      data: {
        isClaimed: true,
        claimedAt: new Date(),
      },
    });

    // Process reward based on type
    if (rewardType === "currency") {
      // Reward is diamonds (for now)
      const diamondsAmount = parseInt(rewardValue, 10);
      if (isNaN(diamondsAmount) || diamondsAmount <= 0) {
        throw new Error("Invalid reward value");
      }

      // Get or create wallet
      const wallet = await tx.wallet.findFirst({
        where: {
          userId: user.id,
          tenantId: "default",
        },
      });

      if (!wallet) {
        // Create wallet if it doesn't exist
        const newWallet = await tx.wallet.create({
          data: {
            userId: user.id,
            tenantId: "default",
            diamonds: diamondsAmount,
            funds: 0,
            badgesClaimedCount: 1,
          },
        });

        // Create ledger entry
        await tx.ledgerEntry.create({
          data: {
            walletId: newWallet.id,
            tenantId: "default",
            kind: "CREDIT",
            amount: diamondsAmount,
            currency: "DIAMONDS",
            refType: "badge_claim",
            refId: userBadgeId,
            note: `Badge reward: ${badge.name || badge.title || badge.slug}`,
          },
        });
      } else {
        // Update existing wallet
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            diamonds: { increment: diamondsAmount },
            badgesClaimedCount: { increment: 1 },
          },
        });

        // Create ledger entry
        await tx.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            tenantId: "default",
            kind: "CREDIT",
            amount: diamondsAmount,
            currency: "DIAMONDS",
            refType: "badge_claim",
            refId: userBadgeId,
            note: `Badge reward: ${badge.name || badge.title || badge.slug}`,
          },
        });
      }
    } else if (rewardType === "item") {
      // Future: Add item to inventory
      // For now, just mark as claimed
    } else if (rewardType === "title") {
      // Future: Award title
      // For now, just mark as claimed
    }
  });

  // Get updated user badge
  const updatedUserBadge = await prisma.userBadge.findUnique({
    where: { id: userBadgeId },
    include: {
      badge: true,
    },
  });

  return successResponse({
    success: true,
    message: "Reward claimed!",
    badge: {
      id: badge.id,
      key: badge.key,
      name: badge.name || badge.title || badge.slug,
      rewardType,
      rewardValue,
      isClaimed: true,
    },
    claimedAt: updatedUserBadge?.claimedAt,
  });
});

