import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/lore/latest
 * Returns latest 10 lore entries for the user
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

  // Get latest 10 lore entries
  const loreEntries = await prisma.userLoreEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      sourceType: true,
      sourceId: true,
      tone: true,
      text: true,
      createdAt: true,
    },
  });

  return successResponse({
    success: true,
    entries: loreEntries,
    count: loreEntries.length,
  });
});

