import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError, validationError, notFoundError } from "@/lib/api-handler";
import { z } from "zod";


// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
const ApplyPresetSchema = z.object({
  presetId: z.string().min(1),
});

/**
 * POST /api/admin/presets/apply
 * Applies an economy preset by updating all balance settings
 * Admin-only auth required
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  // Validate request body
  const body = await req.json().catch(() => ({}));
  const parsed = ApplyPresetSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Invalid payload. presetId (string) required.");
  }

  const { presetId } = parsed.data;

  // Get preset
  const preset = await prisma.economyPreset.findUnique({
    where: { id: presetId },
  });

  if (!preset) {
    return notFoundError("Preset not found");
  }

  // Apply modifiers to balance settings
  const modifiers = preset.modifiers as Record<string, number>;
  const updatePromises = Object.entries(modifiers || {}).map(([key, value]) => // sanity-fix
    prisma.balanceSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );

  await Promise.all(updatePromises);

  // TODO: Log action to ActionLog table (if it exists)
  // await prisma.actionLog.create({
  //   data: {
  //     userId: user.id,
  //     action: 'apply_economy_preset',
  //     metadata: { presetId, presetName: preset.name },
  //   },
  // });

  return successResponse({
    success: true,
    preset,
    appliedModifiers: modifiers,
    message: `Preset "${preset.name}" applied successfully`,
  });
});

