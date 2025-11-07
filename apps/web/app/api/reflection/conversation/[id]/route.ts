import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/reflection/conversation/[id]
 * Retrieve last AI response for a reflection (cached 7 days)
 */
export const GET = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
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

  const reflectionId = params.id;

  // Get latest conversation for this reflection
  const conversation = await prisma.reflectionConversation.findFirst({
    where: {
      reflectionId,
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      response: true,
      modelUsed: true,
      toneLevel: true,
      createdAt: true,
      prompt: true,
    },
  });

  if (!conversation) {
    return successResponse({
      success: true,
      conversation: null,
      message: "No conversation found",
    });
  }

  // Check if conversation is older than 7 days (cleanup check)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  if (conversation.createdAt < sevenDaysAgo) {
    return successResponse({
      success: true,
      conversation: null,
      message: "Conversation expired (older than 7 days)",
    });
  }

  return successResponse({
    success: true,
    conversation,
  });
});

