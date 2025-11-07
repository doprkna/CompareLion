import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/lore/all
 * Returns paginated archive for the user
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

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const skip = (page - 1) * limit;

  // Get total count
  const totalCount = await prisma.userLoreEntry.count({
    where: { userId: user.id },
  });

  // Get paginated entries
  const loreEntries = await prisma.userLoreEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
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
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
});

