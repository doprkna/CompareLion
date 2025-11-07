/**
 * Next Questions API (v0.29.24)
 * 
 * GET /api/questions/next
 * Returns up to 3 contextual questions based on user archetype, mood, and tone
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      archetypeKey: true,
      settings: true,
      level: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Check rate limit (3 question sets per day)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayQuestions = await prisma.userQuestion.count({
    where: {
      userId: user.id,
      servedAt: { gte: todayStart },
    },
  });

  if (todayQuestions >= 3) {
    return successResponse({
      questions: [],
      message: 'Daily limit reached (3 question sets per day)',
      limitReached: true,
    });
  }

  // Get user tone preference from settings
  const userTone = (user.settings as any)?.roastLevel || 3; // 1-5 scale, default 3 (neutral)
  const toneMap: Record<number, string> = {
    1: 'serious',
    2: 'serious',
    3: 'neutral', // Map to poetic for default
    4: 'funny',
    5: 'chaotic',
  };
  const preferredTone = toneMap[userTone] || 'poetic';

  // Map archetype key to ArchetypeAffinity
  const archetypeMap: Record<string, string> = {
    warrior: 'guardian',
    thinker: 'thinker',
    trickster: 'trickster',
    charmer: 'wanderer',
    chaos: 'chaos',
  };

  const userArchetype = user.archetypeKey ? archetypeMap[user.archetypeKey] || null : null;

  // Build query for templates
  const where: any = {
    isActive: true,
    OR: [
      // Archetype match (if user has archetype)
      ...(userArchetype ? [{ archetypeAffinity: userArchetype }] : []),
      // Tone match
      { tone: preferredTone },
      // Daily category (always available)
      { category: 'daily' },
      // Wildcard (fallback)
      { category: 'wildcard' },
    ],
  };

  // Get recently served templates to avoid duplicates
  const recentTemplates = await prisma.userQuestion.findMany({
    where: {
      userId: user.id,
      questionTemplateId: { not: null },
      servedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    },
    select: { questionTemplateId: true },
    take: 20,
  });

  const recentTemplateIds = recentTemplates
    .map(r => r.questionTemplateId)
    .filter((id): id is string => !!id);

  if (recentTemplateIds.length > 0) {
    where.NOT = { id: { in: recentTemplateIds } };
  }

  // Get templates with weight-based selection
  // Note: Prisma generates QuestionTemplate as questionTemplate in client
  const templates = await (prisma as any).questionTemplate.findMany({
    where,
    orderBy: { weight: 'desc' },
    take: 20,
  });

  if (templates.length === 0) {
    // Fallback to any active template
    const fallbackTemplates = await (prisma as any).questionTemplate.findMany({
      where: { isActive: true },
      take: 10,
    });

    if (fallbackTemplates.length === 0) {
      return successResponse({
        questions: [],
        message: 'No questions available',
      });
    }

    // Select up to 3 using weighted random
    const selected = selectWeightedRandom(fallbackTemplates, 3);
    return formatQuestions(selected, user.id);
  }

  // Weight by template weight and select up to 3
  const selected = selectWeightedRandom(templates, 3);

  // Log served questions
  for (const template of selected) {
    await prisma.userQuestion.create({
      data: {
        userId: user.id,
        questionTemplateId: template.id,
        status: 'served',
        servedAt: new Date(),
        archetypeContext: userArchetype || null,
        moodContext: preferredTone,
      },
    });
  }

  return formatQuestions(selected, user.id);
});

/**
 * Select weighted random templates
 */
function selectWeightedRandom(
  templates: Array<{ id: string; weight: number }>,
  count: number
): typeof templates {
  const selected: typeof templates = [];
  const available = [...templates];

  for (let i = 0; i < count && available.length > 0; i++) {
    const totalWeight = available.reduce((sum, t) => sum + (t.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (let j = 0; j < available.length; j++) {
      random -= available[j].weight || 1;
      if (random <= 0) {
        selected.push(available[j]);
        available.splice(j, 1);
        break;
      }
    }
  }

  return selected;
}

/**
 * Format questions for response
 */
async function formatQuestions(
  templates: Array<{ id: string; text: string; category: string; tone: string; tags: string[] }>,
  userId: string
) {
  return successResponse({
    questions: templates.map(t => ({
      id: t.id,
      text: t.text,
      category: t.category,
      tone: t.tone,
      tags: t.tags,
    })),
    count: templates.length,
  });
}

