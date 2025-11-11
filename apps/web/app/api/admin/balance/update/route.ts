import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError, validationError } from "@/lib/api-handler";
import { z } from "zod";


// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
const UpdateSettingSchema = z.object({
  key: z.string().min(1),
  value: z.number().min(0.5).max(2.0),
});

/**
 * POST /api/admin/balance/update
 * Updates a specific balance setting
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
  const parsed = UpdateSettingSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Invalid payload. key (string) and value (number 0.5-2.0) required.");
  }

  const { key, value } = parsed.data;

  // Update or create setting
  const setting = await prisma.balanceSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return successResponse({
    success: true,
    setting,
    message: `Setting ${key} updated to ${value}`,
  });
});

