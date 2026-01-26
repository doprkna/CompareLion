/**
 * Question of the Day Service
 * Select and cache daily question
 * v0.37.10 - Question of the Day Widget
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getCached, setCached } from '@/lib/performance/cache';

export interface QOTDData {
  questionId: string;
  text: string;
  tags?: string[];
  stats?: {
    answerCount: number;
    skipRate: number;
  };
}

/**
 * Get UTC date string (YYYY-MM-DD)
 */
function getUTCDateString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get question of the day
 * Selection strategy:
 * 1. Check cache first (per UTC day)
 * 2. Try pre-curated questions (admin flag in metadata)
 * 3. Try highest engagement (most answers today)
 * 4. Random fallback
 */
export async function getQuestionOfTheDay(): Promise<QOTDData | null> {
  const dateKey = getUTCDateString();
  const cacheKey = `qotd:${dateKey}`;

  // Check cache first
  const cached = await getCached<QOTDData>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    let question: any = null;

    // Strategy A: Pre-curated question (check metadata for isQOTD flag)
    // Use raw query for JSONB metadata check
    const curatedResults = await prisma.$queryRaw<Array<{
      id: string;
      text: string;
      tags: string[];
    }>>`
      SELECT id, text, tags
      FROM "QuestionTemplate"
      WHERE "isActive" = true
        AND metadata->>'isQOTD' = 'true'
      LIMIT 1
    `;

    const curated = curatedResults.length > 0 ? curatedResults[0] : null;

    if (curated) {
      question = curated;
    } else {
      // Strategy B: Highest engagement today (most answers)
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setUTCHours(23, 59, 59, 999);

      // Get question templates with most answers today
      const topQuestions = await prisma.$queryRaw<Array<{
        questionTemplateId: string;
        answerCount: number;
      }>>`
        SELECT 
          ur.metadata->>'questionTemplateId' as "questionTemplateId",
          COUNT(*)::int as "answerCount"
        FROM "UserReflection" ur
        WHERE ur.metadata->>'questionTemplateId' IS NOT NULL
          AND ur."createdAt" >= ${todayStart}
          AND ur."createdAt" <= ${todayEnd}
        GROUP BY ur.metadata->>'questionTemplateId'
        ORDER BY "answerCount" DESC
        LIMIT 10
      `;

      if (topQuestions.length > 0) {
        // Pick random from top 3
        const top3 = topQuestions.slice(0, 3);
        const selected = top3[Math.floor(Math.random() * top3.length)];
        
        const found = await (prisma as any).questionTemplate.findUnique({
          where: { id: selected.questionTemplateId },
          select: {
            id: true,
            text: true,
            tags: true,
          },
        });

        if (found) {
          question = found;
        }
      }

      // Strategy C: Random fallback
      if (!question) {
        const allActive = await (prisma as any).questionTemplate.findMany({
          where: { isActive: true },
          select: {
            id: true,
            text: true,
            tags: true,
          },
          take: 50,
        });

        if (allActive.length > 0) {
          question = allActive[Math.floor(Math.random() * allActive.length)];
        }
      }
    }

    if (!question) {
      logger.warn('[QOTD] No question found');
      return null;
    }

    // Get basic stats
    const answerCountResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM "UserReflection"
      WHERE metadata->>'questionTemplateId' = ${question.id}
    `;

    const answerCount = Number(answerCountResult[0]?.count || 0);

    const skipCount = await prisma.skipQuestion.count({
      where: { questionId: question.id },
    });

    const totalInteractions = answerCount + skipCount;
    const skipRate = totalInteractions > 0 ? (skipCount / totalInteractions) * 100 : 0;

    const qotdData: QOTDData = {
      questionId: question.id,
      text: question.text || '',
      tags: question.tags || [],
      stats: {
        answerCount,
        skipRate: Math.round(skipRate * 100) / 100,
      },
    };

    // Cache for 24 hours (until next UTC day)
    const ttl = 24 * 60 * 60; // 24 hours in seconds
    await setCached(cacheKey, qotdData, { ttl });

    return qotdData;
  } catch (error) {
    logger.error('[QOTD] Failed to get question of the day', { error });
    return null;
  }
}

