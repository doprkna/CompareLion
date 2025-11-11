import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError } from "@/lib/api-handler";
import { resolveAllAlerts } from "@/lib/system/alerts";

/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * POST /api/admin/alerts/resolve-all
 * Resolves all open alerts
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

  // Resolve all alerts
  const count = await resolveAllAlerts();

  return successResponse({
    success: true,
    message: `Resolved ${count} alerts`,
    count,
  });
});






