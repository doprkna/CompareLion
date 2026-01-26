import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError, notFoundError } from "@/lib/api-handler";

/**
 * DELETE /api/admin/alerts/webhooks/[id]
 * Deletes a specific webhook
 * Admin-only auth required
 * v0.33.1 - Alert Notifications & Webhooks
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  const { id } = params;

  // Check if webhook exists
  const webhook = await prisma.alertWebhook.findUnique({
    where: { id },
  });

  if (!webhook) {
    return notFoundError("Webhook not found");
  }

  // Delete webhook
  await prisma.alertWebhook.delete({
    where: { id },
  });

  return successResponse({
    success: true,
    message: `Webhook "${webhook.name}" deleted`,
  });
});

/**
 * PATCH /api/admin/alerts/webhooks/[id]
 * Updates webhook (toggle active status or change URL)
 * Admin-only auth required
 */
export const PATCH = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  const { id } = params;

  // Check if webhook exists
  const webhook = await prisma.alertWebhook.findUnique({
    where: { id },
  });

  if (!webhook) {
    return notFoundError("Webhook not found");
  }

  // Get update data
  const body = await req.json().catch(() => ({}));
  const { isActive, name, url } = body;

  // Update webhook
  const updated = await prisma.alertWebhook.update({
    where: { id },
    data: {
      ...(isActive !== undefined && { isActive }),
      ...(name && { name }),
      ...(url && { url }),
    },
  });

  return successResponse({
    success: true,
    webhook: updated,
    message: `Webhook "${updated.name}" updated`,
  });
});









