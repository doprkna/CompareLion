import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const ToneSchema = z.object({
  tone: z.enum(["serious", "comedic", "poetic"]),
});

/**
 * POST /api/lore/tone
 * Updates user's preferred narrative tone
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, settings: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ToneSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { tone } = parsed.data;

  // Update user settings with loreTone preference
  const userSettings = (user.settings as any) || {};
  userSettings.loreTone = tone;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      settings: userSettings,
    },
  });

  return successResponse({
    success: true,
    message: "Tone preference updated",
    tone,
  });
});

