import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { getArchetypeHistory } from "@/lib/archetype";
import { safeAsync, successResponse, unauthorizedError, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/archetype/history
 * Get user's archetype evolution history
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return notFoundError('User');
  }

  const history = await getArchetypeHistory(user.id, 20);

  return successResponse({ history });
});













