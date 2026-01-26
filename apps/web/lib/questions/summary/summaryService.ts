/**
 * Question Summary Service
 * Generate AI summaries of question answer threads
 * v0.37.8 - AI Summary Snippet
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';
import { cached } from '@/app/api/_cache';

const SUMMARY_CACHE_TTL = 30 * 60 * 1000; // 30 minutes default (configurable via env)

/**
 * Generate a short AI summary of all answers to a question
 * 
 * @param questionTemplateId - Question template ID
 * @returns Summary text (1-2 sentences)
 */
export async function generateSummarySnippet(
  questionTemplateId: string
): Promise<string> {
  const cacheKey = `summary:${questionTemplateId}`;
  
  return cached(cacheKey, SUMMARY_CACHE_TTL, async () => {
    try {
      // Fetch all answers (reflections) for this question
      const reflections = await prisma.$queryRaw<Array<{ content: string }>>`
        SELECT content
        FROM "UserReflection"
        WHERE metadata->>'questionTemplateId' = ${questionTemplateId}
          AND content IS NOT NULL
          AND LENGTH(content) > 10
        ORDER BY "createdAt" DESC
        LIMIT 50
      `;

      if (reflections.length === 0) {
        return 'No answers yet for this question.';
      }

      // Get question text for context
      const questionTemplate = await (prisma as any).questionTemplate.findUnique({
        where: { id: questionTemplateId },
        select: { text: true },
      });

      const questionText = questionTemplate?.text || 'this question';

      // Prepare answers text (trim and clean)
      const answersText = reflections
        .map(r => r.content?.trim())
        .filter(Boolean)
        .slice(0, 30) // Limit to 30 answers to keep prompt short
        .join('\n\n');

      if (!answersText) {
        return 'No valid answers found for this question.';
      }

      // Generate summary using AI
      const summary = await callAIForSummary(questionText, answersText);

      return summary || 'Unable to generate summary at this time.';
    } catch (error) {
      logger.error('[QuestionSummary] Failed to generate summary', {
        questionTemplateId,
        error,
      });
      return 'Unable to generate summary at this time.';
    }
  });
}

/**
 * Call AI API to generate summary
 */
async function callAIForSummary(questionText: string, answersText: string): Promise<string> {
  // Check if GPT is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback to simple text summarization
    return generateSimpleSummary(answersText);
  }

  try {
    const systemPrompt = `You are a concise summarizer. Create very short summaries (1-2 sentences) that capture the main themes from user responses. Be factual and neutral.`;

    const userPrompt = `Question: "${questionText}"

User answers:
${answersText.substring(0, 3000)}${answersText.length > 3000 ? '...' : ''}

Generate a 1-2 sentence summary of the common themes in these answers. Be concise and factual.`;

    const response = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 150, // Keep it short
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return generateSimpleSummary(answersText);
    }

    // Ensure summary is 1-2 sentences max
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join('. ').trim() + (sentences.length > 2 ? '.' : '');
  } catch (error) {
    logger.warn('[QuestionSummary] AI call failed, using fallback', { error });
    return generateSimpleSummary(answersText);
  }
}

/**
 * Simple fallback summarization (no AI)
 */
function generateSimpleSummary(answersText: string): string {
  const answers = answersText.split('\n\n').filter(a => a.trim().length > 0);
  const answerCount = answers.length;
  
  if (answerCount === 0) {
    return 'No answers available.';
  }

  // Extract first few words from first answer as a simple summary
  const firstAnswer = answers[0].substring(0, 100);
  const words = firstAnswer.split(/\s+/).slice(0, 15).join(' ');
  
  return `Based on ${answerCount} answer${answerCount > 1 ? 's' : ''}, users shared: ${words}...`;
}

