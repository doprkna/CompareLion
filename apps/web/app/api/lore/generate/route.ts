import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const GenerateLoreSchema = z.object({
  sourceType: z.enum(["reflection", "quest", "item", "event", "system"]),
  sourceId: z.string().optional(),
});

/**
 * Lore templates by tone and source type
 */
const LORE_TEMPLATES: Record<string, Record<string, string[]>> = {
  serious: {
    reflection: [
      "In silence, {username} found a new resolve.",
      "{username} confronted their thoughts and emerged stronger.",
      "Through introspection, {username} discovered inner strength.",
      "The quiet moments shaped {username}'s journey.",
      "{username} reflected deeply and found clarity.",
    ],
    quest: [
      "{username} completed a great task and proved their worth.",
      "Another challenge conquered by {username}.",
      "{username} emerged victorious from the trial.",
      "The path forward opened for {username}.",
      "{username} demonstrated resilience and determination.",
    ],
    item: [
      "{username} discovered a treasure that told a story.",
      "A new artifact joined {username}'s collection.",
      "{username} found something rare and meaningful.",
    ],
    event: [
      "A significant moment marked {username}'s path.",
      "The world shifted around {username}.",
      "History remembered this moment for {username}.",
    ],
    system: [
      "{username} reached a new milestone.",
      "The journey of {username} continued to unfold.",
      "Progress marked {username}'s path forward.",
    ],
  },
  comedic: {
    reflection: [
      "{username} accidentally reflected so hard they leveled up twice.",
      "{username} thought so deeply they forgot what they were doing.",
      "The mind of {username} worked overtime, producing chaos and wisdom.",
      "{username} overthought everything and somehow it worked.",
      "{username} reflected themselves into a new dimension of confusion.",
    ],
    quest: [
      "{username} completed a quest with style and a touch of chaos.",
      "Somehow, {username} managed to succeed despite everything.",
      "{username} took the scenic route to victory.",
      "The quest ended, much to {username}'s surprise.",
    ],
    item: [
      "{username} found something shiny and immediately forgot why they needed it.",
      "A new item appeared in {username}'s inventory. How? Nobody knows.",
    ],
    event: [
      "{username} caused a minor incident that became legendary.",
      "Things happened around {username}. It was fine. Probably.",
    ],
    system: [
      "{username} broke the system in the best possible way.",
      "The system tried to keep up with {username} and failed.",
    ],
  },
  poetic: {
    reflection: [
      "Moonlight witnessed {username} exchanging thoughts for XP.",
      "In the quiet hours, {username} wove wisdom from silence.",
      "The stars listened as {username} unraveled their inner mysteries.",
      "{username}'s reflection danced with the shadows of possibility.",
      "Time stood still as {username} journeyed inward.",
    ],
    quest: [
      "Like a phoenix rising, {username} emerged from the trial.",
      "The threads of fate wove a new chapter for {username}.",
      "Destiny smiled upon {username}'s completion of the quest.",
      "The winds of change carried {username} to victory.",
    ],
    item: [
      "{username} touched an artifact and felt the weight of stories.",
      "Magic whispered to {username} through the newfound treasure.",
    ],
    event: [
      "The universe paused to acknowledge {username}'s moment.",
      "Reality itself bent slightly around {username}'s presence.",
    ],
    system: [
      "The digital realm celebrated {username}'s progress.",
      "{username}'s journey etched itself into the chronicles of time.",
    ],
  },
};

/**
 * Generate lore snippet based on templates
 */
function generateLore(
  sourceType: string,
  tone: "serious" | "comedic" | "poetic",
  username: string
): string {
  const templates = LORE_TEMPLATES[tone]?.[sourceType] || LORE_TEMPLATES[tone]?.system || [];
  if (templates.length === 0) {
    return `${username} did something notable.`;
  }

  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace(/{username}/g, username);
}

/**
 * POST /api/lore/generate
 * Generates a short lore snippet via local templates
 * Triggered when user completes an action (reflection, quest, loot moment)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      username: true,
      name: true,
      settings: true,
    },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = GenerateLoreSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { sourceType, sourceId } = parsed.data;

  // Get user's preferred tone from settings, default to comedic/poetic hybrid
  const userSettings = user.settings as any;
  const preferredTone = userSettings?.loreTone || (Math.random() > 0.5 ? "comedic" : "poetic");

  // Generate lore text
  const displayName = user.username || user.name || "The Traveler";
  const loreText = generateLore(sourceType, preferredTone as "serious" | "comedic" | "poetic", displayName);

  // Limit to 300 characters
  const trimmedText = loreText.substring(0, 300);

  // Check entry limit (max 50 per user)
  const entryCount = await prisma.userLoreEntry.count({
    where: { userId: user.id },
  });

  if (entryCount >= 50) {
    // Delete oldest entry
    const oldestEntry = await prisma.userLoreEntry.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });

    if (oldestEntry) {
      await prisma.userLoreEntry.delete({
        where: { id: oldestEntry.id },
      });
    }
  }

  // Create lore entry
  const loreEntry = await prisma.userLoreEntry.create({
    data: {
      userId: user.id,
      sourceType: sourceType as any,
      sourceId: sourceId || null,
      tone: preferredTone as any,
      text: trimmedText,
    },
  });

  return successResponse({
    success: true,
    message: "Lore entry generated",
    entry: {
      id: loreEntry.id,
      text: loreEntry.text,
      tone: loreEntry.tone,
      sourceType: loreEntry.sourceType,
      createdAt: loreEntry.createdAt,
    },
  });
});

