import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { publishEvent } from "@/lib/realtime";
import { safeAsync, successResponse, unauthorizedError, validationError } from "@/lib/api-handler";

/**
 * Typing indicator endpoint
 * Broadcasts typing events to other users
 * No database persistence - ephemeral events only
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const { toUserId, isTyping } = await req.json();

  if (!toUserId) {
    return validationError('toUserId required');
  }

  // Broadcast typing event (lightweight, no DB)
  await publishEvent("typing", {
    fromEmail: session.user.email,
    fromUserId: session.user.id,
    toUserId,
    isTyping: isTyping !== false, // Default to true
    timestamp: Date.now(),
  });

  return successResponse({});
});













