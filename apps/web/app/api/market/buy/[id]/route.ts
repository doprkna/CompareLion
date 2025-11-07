import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { purchaseItem, cancelListing } from "@/lib/marketplace";
import { safeAsync, successResponse, unauthorizedError, notFoundError } from "@/lib/api-handler";

/**
 * PATCH /api/market/buy/[id]
 * Purchase item from marketplace
 */
export const PATCH = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  const listingId = params.id;

  const result = await purchaseItem(listingId, user.id);

  return successResponse({ result }, 'Purchase successful!');
});

/**
 * DELETE /api/market/buy/[id]
 * Cancel own listing
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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

  const listingId = params.id;

  await cancelListing(listingId, user.id);

  return successResponse(undefined, 'Listing cancelled');
});













