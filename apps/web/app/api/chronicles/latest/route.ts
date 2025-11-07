import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/chronicles/latest
 * Returns latest chronicle (weekly or seasonal)
 * Query params: ?type=weekly|seasonal (optional, defaults to weekly)
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
  const typeParam = searchParams.get("type") || "weekly";
  const chronicleType = typeParam.toLowerCase() as "weekly" | "seasonal";

  // Get latest chronicle
  const chronicle = await prisma.chronicle.findFirst({
    where: {
      userId: user.id,
      type: chronicleType,
    },
    include: {
      season: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      generatedAt: "desc",
    },
  });

  if (!chronicle) {
    return successResponse({
      success: true,
      chronicle: null,
      message: "No chronicle found",
    });
  }

  return successResponse({
    success: true,
    chronicle: {
      id: chronicle.id,
      type: chronicle.type,
      summaryText: chronicle.summaryText,
      stats: chronicle.statsJson,
      quote: chronicle.quote,
      generatedAt: chronicle.generatedAt,
      season: chronicle.season,
    },
  });
});

