import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { performCrafting } from "@/lib/crafting";
import { notify } from "@/lib/notify";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from "@/lib/api-handler";

/**
 * POST /api/crafting/perform
 * Attempt to craft an item
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

  const body = await req.json();
  const { recipeId } = body;

  if (!recipeId) {
    return validationError('recipeId required');
  }

    // Perform crafting
    const result = await performCrafting(user.id, recipeId);

  // Send notification
  if (result.success) {
    await notify(
      user.id,
      "crafting_success",
      "Crafting Successful!",
      `You crafted ${result.outputItem?.name} (${result.rarityAchieved})`
    );
  } else {
    await notify(
      user.id,
      "crafting_failed",
      "Crafting Failed",
      "Materials were lost in the attempt"
    );
  }

  return successResponse({ result });
});













