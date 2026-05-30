/**
 * Flow Skeleton - Simple Question Flow
 * v0.35.13 - Rebuilt to use FlowQuestion & UserResponse models
 * Login â†’ Pick Category â†’ Sequential Questions â†’ Result
 *
 * TODO: Use @parel/db when TS project-refs resolve correctly.
 * Relative ../../db avoids tsconfig.base.json path @parel/* -> packages/star/src.
 * pulling db/src into this package's rootDir and breaking tsc -b.
 */
import { prisma } from '../../db';
import { incrementQuestionStatsForFlowAnswer } from '../../db/src/questionSource/statsBackfill';
import { recordFlowQuestionServe } from '../../db/src/questionSource/serveEvent';
import {
  getRecentQuestionHistory,
  buildHistoryIndex,
  applyDistanceFilters,
  HISTORY_LIMIT
} from './distanceRules';

export interface FlowSession {
  id: string;
  userId: string;
  categoryId: string;
  currentQuestionIndex: number;
  questionsAnswered: number;
  questionsSkipped: number;
  startedAt: Date;
  completedAt?: Date;
  totalQuestions?: number;
}

export interface FlowQuestion {
  id: string;
  text: string;
  type: string;
  difficulty: string;
  categoryName: string;
  challengeEnabled?: boolean;
  options?: Array<{
    id: string;
    label: string;
    value: string;
    order: number;
  }>;
}

export interface FlowResult {
  questionsAnswered: number;
  questionsSkipped: number;
  totalQuestions: number;
  xpGained: number;
  streakCount: number;
  completionRate: number;
  /** v0.45.2 - Percentile feedback */
  xpEarned: number;
  percentile: number;
  average: number;
  totalAnswers: number;
}

/**
 * Start a new flow session
 */
export async function startFlow(userId: string, categoryId: string): Promise<FlowSession> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
    throw new Error('Invalid categoryId: must be a non-empty string');
  }

  // Verify category exists
  const category = await prisma.sssCategory.findUnique({
    where: { id: categoryId }
  });
  
  if (!category) {
    throw new Error('Category not found');
  }
  
  const totalQuestions = await prisma.flowQuestion.count({
    where: { categoryId, isActive: true }
  });

  const session: FlowSession = {
    id: `flow_${Date.now()}_${userId.substring(0, 8)}`,
    userId,
    categoryId,
    currentQuestionIndex: 0,
    questionsAnswered: 0,
    questionsSkipped: 0,
    startedAt: new Date(),
    totalQuestions
  };

  return session;
}

/**
 * Get next question in the flow using FlowQuestion model.
 * v0.47.13 - Distance rules: exclude similar questions appearing too close together.
 */
export async function getNextQuestion(
  userId: string,
  categoryId: string
): Promise<FlowQuestion | null> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
    throw new Error('Invalid categoryId: must be a non-empty string');
  }

  // Get questions user has already answered
  const answeredQuestions = await prisma.userResponse.findMany({
    where: { userId },
    select: { questionId: true }
  });
  
  const answeredIds = answeredQuestions.map(q => q.questionId);

  // 1. Generate candidate pool (unanswered, ordered oldest first)
  const candidates = await prisma.flowQuestion.findMany({
    where: {
      categoryId,
      isActive: true,
      id: answeredIds.length > 0 ? { notIn: answeredIds } : undefined,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      categoryId: true,
      category: { select: { subSubCategoryId: true } },
      tags: true,
      arcStep: true
    }
  });

  if (candidates.length === 0) {
    return null; // All questions answered
  }

  // 2. Fetch recent history once
  const history = await getRecentQuestionHistory(userId, HISTORY_LIMIT);
  const index = buildHistoryIndex(history);

  // 3. Apply distance filters (flow exception: relax category/subcategory for current topic)
  const candidateMap = candidates.map(c => ({
    id: c.id,
    categoryId: c.categoryId ?? null,
    subSubCategoryId: c.category?.subSubCategoryId ?? null,
    tags: Array.isArray(c.tags) ? c.tags : [],
    arcStep: c.arcStep ?? null
  }));
  let filtered = applyDistanceFilters(candidateMap, index, categoryId);

  if (filtered.length === 0) {
    return null; // No question passes distance rules
  }

  // 4. Prefer arc step order (C21): entry < context < reflection < comparison < wildcard
  const ARC_ORDER: Record<string, number> = {
    entry: 0, context: 1, reflection: 2, comparison: 3, wildcard: 4
  };
  filtered = [...filtered].sort((a, b) => {
    const oa = a.arcStep ? (ARC_ORDER[a.arcStep] ?? 99) : 99;
    const ob = b.arcStep ? (ARC_ORDER[b.arcStep] ?? 99) : 99;
    return oa - ob;
  });

  const selectedId = filtered[0].id;

  // 5. Fetch full question for response
  const flowQuestion = await prisma.flowQuestion.findUnique({
    where: { id: selectedId },
    include: {
      options: { orderBy: { order: 'asc' } },
      category: { select: { name: true } }
    }
  });

  if (!flowQuestion) {
    return null;
  }

  void recordFlowQuestionServe(prisma, {
    flowQuestionId: flowQuestion.id,
    sourceQuestionId: flowQuestion.sourceQuestionId,
    userId,
    context: 'flow',
  });

  return {
    id: flowQuestion.id,
    text: flowQuestion.text,
    type: flowQuestion.type,
    difficulty: 'medium',
    categoryName: flowQuestion.category?.name || 'Unknown',
    challengeEnabled: flowQuestion.challengeEnabled ?? false,
    options: flowQuestion.options.map(opt => ({
      id: opt.id,
      label: opt.label,
      value: opt.value,
      order: opt.order
    }))
  };
}

/**
 * Submit an answer to a question using UserResponse model
 */
export async function answerQuestion(
  userId: string,
  questionId: string,
  optionIds?: string[],
  textValue?: string,
  numericValue?: number
): Promise<void> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!questionId || typeof questionId !== 'string' || questionId.trim().length === 0) {
    throw new Error('Invalid questionId: must be a non-empty string');
  }

  // Calculate XP gain
  const xpGain = 10; // Base XP for answering
  
  // Record the answer and update user stats in a transaction
  try {
    await prisma.$transaction([
    // Create user response
    prisma.userResponse.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      create: {
        userId,
        questionId,
        optionIds: optionIds || [],
        textVal: textValue || null,
        numericVal: numericValue || null,
        skipped: false
      },
      update: {
        optionIds: optionIds || [],
        textVal: textValue || null,
        numericVal: numericValue || null,
        skipped: false
      }
    }),
    
    // Update user stats
    prisma.user.update({
      where: { id: userId },
      data: {
        questionsAnswered: { increment: 1 },
        xp: { increment: xpGain },
        lastAnsweredAt: new Date(),
        streakCount: { increment: 1 }
      }
    })
    ]);
    await incrementQuestionStatsForFlowAnswer(prisma, questionId);
  } catch (error) {
    // Transaction error handling with clearer message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to record answer: ${errorMessage}`);
  }
}

/**
 * Skip a question using UserResponse model
 */
export async function skipQuestion(
  userId: string,
  questionId: string
): Promise<void> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!questionId || typeof questionId !== 'string' || questionId.trim().length === 0) {
    throw new Error('Invalid questionId: must be a non-empty string');
  }

  // Mark question as skipped
  await prisma.userResponse.upsert({
    where: {
      userId_questionId: {
        userId,
        questionId
      }
    },
    create: {
      userId,
      questionId,
      skipped: true,
      optionIds: []
    },
    update: {
      skipped: true
    }
  });
  
  // Reset streak when skipping
  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCount: 0
    }
  });
}

/**
 * Get flow completion result
 */
export async function getFlowResult(
  userId: string,
  categoryId: string
): Promise<FlowResult> {
  // Input validation: guard against empty strings
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!categoryId || typeof categoryId !== 'string' || categoryId.trim().length === 0) {
    throw new Error('Invalid categoryId: must be a non-empty string');
  }

  // Get all active questions in category
  const totalQuestions = await prisma.flowQuestion.count({
    where: {
      categoryId,
      isActive: true
    }
  });
  
  // Get user's responses for this category's questions
  const responses = await prisma.userResponse.findMany({
    where: {
      userId,
      question: { categoryId }
    },
    select: { skipped: true }
  });
  
  const questionsAnswered = responses.filter(r => !r.skipped).length;
  const questionsSkipped = responses.filter(r => r.skipped).length;
  
  // Get user's current stats (optimized: select only needed fields)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, streakCount: true }
  });
  
  const xpGained = questionsAnswered * 10; // Estimate based on answered questions
  const streakCount = user?.streakCount || 0;
  const completionRate = totalQuestions > 0 
    ? Math.round((questionsAnswered / totalQuestions) * 100) 
    : 0;

  // Percentile feedback (v0.45.2): % of users who answered fewer questions in this category
  const categoryQuestionIds = await prisma.flowQuestion.findMany({
    where: { categoryId, isActive: true },
    select: { id: true }
  });
  const qIds = categoryQuestionIds.map(q => q.id);
  
  let percentile = 50;
  let average = questionsAnswered;
  let totalAnswers = 0;

  if (qIds.length > 0) {
    // Per-user answered count (non-skipped) for this category
    const userCounts = await prisma.userResponse.groupBy({
      by: ['userId'],
      where: {
        questionId: { in: qIds },
        skipped: false
      },
      _count: { id: true }
    });
    
    totalAnswers = await prisma.userResponse.count({
      where: { questionId: { in: qIds }, skipped: false }
    });
    
    const answeredPerUser = userCounts.map(u => u._count.id);
    if (answeredPerUser.length > 0) {
      const sum = answeredPerUser.reduce((a, b) => a + b, 0);
      average = Math.round((sum / answeredPerUser.length) * 10) / 10; // 1 decimal
      const usersWithLess = answeredPerUser.filter(c => c < questionsAnswered).length;
      percentile = Math.round((usersWithLess / answeredPerUser.length) * 100);
    }
  }
  
  return {
    questionsAnswered,
    questionsSkipped,
    totalQuestions,
    xpGained,
    streakCount,
    completionRate,
    xpEarned: xpGained,
    percentile,
    average,
    totalAnswers
  };
}

const STARTER_SLUG = 'starter';
const LEVEL_GATE = 3;

/**
 * Get available categories for flow. When userId provided, applies Level 3 gate:
 * level < 3 or !starterFlowCompletedAt -> force starter only.
 */
export async function getAvailableCategories(userId?: string | null): Promise<Array<{
  id: string;
  name: string;
  slug?: string;
  questionCount: number;
  isStarter?: boolean;
}>> {
  let forceStarter = false;
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { level: true, starterFlowCompletedAt: true }
    });
    const level = user?.level ?? 1;
    const completed = !!user?.starterFlowCompletedAt;
    const devUnlock = process.env.DEV_UNLOCK_FLOWS === '1';
    if (!devUnlock && (level < LEVEL_GATE || !completed)) {
      forceStarter = true;
    }
  }

  if (forceStarter) {
    const starter = await prisma.sssCategory.findFirst({
      where: { slug: STARTER_SLUG, isStarter: true },
      select: { id: true, name: true, slug: true, _count: { select: { flowQuestions: true } } }
    });
    if (starter) {
      return [{
        id: starter.id,
        name: starter.name,
        slug: starter.slug ?? undefined,
        questionCount: starter._count.flowQuestions,
        isStarter: true
      }];
    }
  }

  const categories = await prisma.sssCategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      isStarter: true,
      visibleInBrowse: true,
      _count: { select: { flowQuestions: true } }
    },
    where: {
      flowQuestions: { some: { isActive: true } },
      ...(forceStarter ? {} : { visibleInBrowse: true })
    },
    orderBy: { name: 'asc' }
  });

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug ?? undefined,
    questionCount: cat._count.flowQuestions,
    isStarter: cat.isStarter ?? false
  }));
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Get 5 flow choices (C18). Exclude ids for refresh to get different options.
 * Heuristic: shuffle for diversity; excludeIds avoids near-duplicates on refresh.
 */
export async function getFlowChoices(
  userId?: string | null,
  excludeIds?: string[]
): Promise<Array<{ id: string; name: string; slug?: string; questionCount: number; isStarter?: boolean }>> {
  const all = await getAvailableCategories(userId);
  const filtered = excludeIds?.length
    ? all.filter(c => !excludeIds.includes(c.id))
    : all;
  const pooled = filtered.length >= 5 ? filtered : all;
  const shuffled = shuffle(pooled);
  return shuffled.slice(0, 5);
}

/**
 * Check if user is authenticated (helper)
 */
export function isUserAuthenticated(userId?: string): boolean {
  return !!userId && userId.length > 0;
}
