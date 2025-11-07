import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError } from "@/lib/api-handler";

/**
 * GET /api/admin/balance
 * Returns all balance settings
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

  // Get all balance settings
  const settings = await prisma.balanceSetting.findMany({
    orderBy: { key: "asc" },
  });

  // If no settings exist, seed default values
  if (settings.length === 0) {
    const defaultSettings = [
      { key: "xp_multiplier", value: 1.0 },
      { key: "gold_drop_rate", value: 1.0 },
      { key: "item_price_factor", value: 1.0 },
    ];

    await prisma.balanceSetting.createMany({
      data: defaultSettings,
    });

    const newSettings = await prisma.balanceSetting.findMany({
      orderBy: { key: "asc" },
    });

    return successResponse({
      success: true,
      settings: newSettings,
    });
  }

  return successResponse({
    success: true,
    settings,
  });
});

