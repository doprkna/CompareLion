import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError, validationError } from "@/lib/api-handler";
import { z } from "zod";
import { resolveAlert } from "@/lib/system/alerts";

const ResolveAlertSchema = z.object({
  id: z.string().min(1),
});

/**
 * POST /api/admin/alerts/resolve
 * Resolves a specific alert by ID
 * Admin-only auth required
 * v0.33.0 - Alert System & Auto-Recovery Hooks
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
  const parsed = ResolveAlertSchema.safeParse(body);

  if (!parsed.success) {
    return validationError("Invalid payload. id (string) required.");
  }

  const { id } = parsed.data;

  // Resolve alert
  await resolveAlert(id, false);

  return successResponse({
    success: true,
    message: "Alert resolved",
  });
});





