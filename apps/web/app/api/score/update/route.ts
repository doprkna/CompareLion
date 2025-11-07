import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { updateUserScores } from "@/lib/scores";
import { safeAsync, successResponse, unauthorizedError, notFoundError } from "@/lib/api-handler";

/**
 * POST /api/score/update - Recalculate user scores
 * Can be called manually or triggered by other APIs
 */
export const POST = safeAsync(async () => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  const scores = await updateUserScores(user.id);

  return successResponse({ scores });
});

