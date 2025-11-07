import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { checkAndEvolveArchetype } from "@/lib/archetype";
import { safeAsync, successResponse, unauthorizedError, notFoundError } from "@/lib/api-handler";

/**
 * POST /api/archetype/evolve
 * Check and trigger archetype evolution for current user
 */
export const POST = safeAsync(async (req: NextRequest) => {
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

  // Check and evolve
  const result = await checkAndEvolveArchetype(user.id);

  return successResponse({ ...result });
});













