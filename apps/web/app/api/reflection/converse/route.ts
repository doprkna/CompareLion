import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";
import { GEN_CONFIG } from "@/lib/config/generator";

const ConverseSchema = z.object({
  reflectionId: z.string().min(1),
  prompt: z.string().min(1).max(500),
});

/**
 * POST /api/reflection/converse
 * Send reflection text + user context to GPT API (premium only)
 * Falls back to local summarizer if GPT unavailable
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: {
          status: "active",
          currentPeriodEnd: { gt: new Date() },
        },
        take: 1,
      },
    },
    select: {
      id: true,
      archetype: true,
      archetypeKey: true,
      settings: true,
    },
  });

  if (!user) {
    return notFoundError("User");
  }

  // Check premium subscription
  const isPremium = user.subscriptions.length > 0;
  if (!isPremium) {
    return validationError("Premium subscription required for AI conversations");
  }

  // Rate limit: 1 interaction per 2 minutes
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  const recentConversation = await prisma.reflectionConversation.findFirst({
    where: {
      userId: user.id,
      createdAt: { gte: twoMinutesAgo },
    },
  });

  if (recentConversation) {
    return validationError("Please wait 2 minutes between conversations");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ConverseSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { reflectionId, prompt } = parsed.data;

  // Get reflection
  const reflection = await prisma.userReflection.findUnique({
    where: { id: reflectionId },
    select: {
      id: true,
      userId: true,
      content: true,
      sentiment: true,
    },
  });

  if (!reflection) {
    return notFoundError("Reflection not found");
  }

  // Verify ownership
  if (reflection.userId !== user.id) {
    return validationError("Not authorized to converse on this reflection");
  }

  // Get roast level from user settings (1-5)
  const settings = (user.settings as any) || {};
  const roastLevel = settings.roastLevel || 3;
  const toneLevel = Math.max(1, Math.min(5, roastLevel)); // Ensure 1-5

  // Prepare context
  const archetype = user.archetype || user.archetypeKey || "Adventurer";
  const mood = reflection.sentiment || "neutral";

  // Build GPT prompt
  const systemPrompt = buildSystemPrompt(toneLevel);
  const userPrompt = buildUserPrompt(reflection.content, prompt, archetype, mood);

  let response: string;
  let modelUsed: string;

  // Try GPT API if available
  if (GEN_CONFIG.GPT_URL && GEN_CONFIG.GPT_KEY) {
    try {
      const gptResponse = await callGPTAPI(systemPrompt, userPrompt);
      response = gptResponse;
      modelUsed = "gpt-4";
    } catch (err) {
      console.error("GPT API error:", err);
      // Fallback to local summarizer
      response = generateLocalResponse(reflection.content, prompt, toneLevel);
      modelUsed = "local-fallback";
    }
  } else {
    // Use local fallback
    response = generateLocalResponse(reflection.content, prompt, toneLevel);
    modelUsed = "local";
  }

  // Store conversation
  const conversation = await prisma.reflectionConversation.create({
    data: {
      userId: user.id,
      reflectionId: reflection.id,
      prompt,
      response,
      toneLevel,
      modelUsed,
    },
  });

  return successResponse({
    success: true,
    conversation: {
      id: conversation.id,
      response: conversation.response,
      modelUsed: conversation.modelUsed,
      toneLevel: conversation.toneLevel,
      createdAt: conversation.createdAt,
    },
  });
});

// Helper: Call GPT API
async function callGPTAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch(GEN_CONFIG.GPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
}

// Helper: Build system prompt based on tone level
function buildSystemPrompt(toneLevel: number): string {
  if (toneLevel <= 2) {
    return "You are a supportive AI mentor helping users reflect on their thoughts. Be warm, encouraging, and understanding. Focus on validation and gentle guidance.";
  } else if (toneLevel === 3) {
    return "You are a neutral AI assistant helping users reflect on their thoughts. Be balanced, factual, and helpful. Provide clear insights without strong emotional tone.";
  } else {
    return "You are a playful AI mentor helping users reflect on their thoughts. You can be slightly sarcastic or witty, but always constructive and friendly. Use humor to make insights more engaging.";
  }
}

// Helper: Build user prompt with context
function buildUserPrompt(content: string, prompt: string, archetype: string, mood: string): string {
  return `User Reflection:
"${content}"

User Archetype: ${archetype}
Mood: ${mood}

User Question: "${prompt}"

Please provide a thoughtful response to the user's question about their reflection.`;
}

// Helper: Generate local fallback response
function generateLocalResponse(content: string, prompt: string, toneLevel: number): string {
  const responses = {
    supportive: [
      "Your reflection shows thoughtful consideration. Consider exploring what made this moment meaningful for you.",
      "It's valuable that you're taking time to reflect. What patterns do you notice in your thoughts?",
      "Your self-awareness is a strength. What would you like to understand better about this reflection?",
    ],
    neutral: [
      "This reflection touches on several themes. What aspect would you like to explore further?",
      "Your reflection presents interesting perspectives. What questions arise from this?",
      "Consider what this reflection reveals about your current state of mind.",
    ],
    playful: [
      "Interesting reflection! 🎭 What's the plot twist you're not seeing yet?",
      "Ah, a classic reflection dilemma! What would your archetype say about this?",
      "Plotting your next move, I see. What's the real story behind this reflection?",
    ],
  };

  let category: "supportive" | "neutral" | "playful";
  if (toneLevel <= 2) {
    category = "supportive";
  } else if (toneLevel === 3) {
    category = "neutral";
  } else {
    category = "playful";
  }

  const categoryResponses = responses[category];
  return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
}

