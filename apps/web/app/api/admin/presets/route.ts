import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError } from "@/lib/api-handler";

/**
 * GET /api/admin/presets
 * Returns all economy presets
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

  // Get all presets
  const presets = await prisma.economyPreset.findMany({
    orderBy: { name: "asc" },
  });

  // If no presets exist, seed default presets
  if (presets.length === 0) {
    const defaultPresets = [
      {
        name: "Easy",
        description: "Generous rewards and lower prices for casual gameplay",
        modifiers: {
          xp_multiplier: 1.5,
          gold_drop_rate: 1.5,
          item_price_factor: 0.8,
        },
      },
      {
        name: "Normal",
        description: "Balanced economy with standard multipliers",
        modifiers: {
          xp_multiplier: 1.0,
          gold_drop_rate: 1.0,
          item_price_factor: 1.0,
        },
      },
      {
        name: "Hard",
        description: "Challenging economy with reduced rewards and higher prices",
        modifiers: {
          xp_multiplier: 0.8,
          gold_drop_rate: 0.7,
          item_price_factor: 1.3,
        },
      },
    ];

    await prisma.economyPreset.createMany({
      data: defaultPresets,
    });

    const newPresets = await prisma.economyPreset.findMany({
      orderBy: { name: "asc" },
    });

    return successResponse({
      success: true,
      presets: newPresets,
    });
  }

  return successResponse({
    success: true,
    presets,
  });
});

