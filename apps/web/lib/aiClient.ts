/**
 * AI Client for Question Generation
 * 
 * Handles communication with the GPT API endpoint for generating questions
 */

import { GEN_CONFIG } from '@parel/core/config/generator';
import { logError } from '@/lib/errors';

export type GenRequest = {
  categoryName: string;
  categoryPath?: string[]; // Parent lineage
  language: string;
  minCount: number;
  maxCount: number;
};

export type GenResponse = {
  questions: string[];
  meta?: any;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
};

/**
 * Generate questions for a category using the GPT API
 * 
 * @param req - Generation request parameters
 * @returns Array of generated questions with metadata
 * @throws Error if generation fails
 */
export async function generateQuestions(req: GenRequest): Promise<GenResponse> {
  if (!GEN_CONFIG.GPT_URL) {
    throw new Error('GPT_GEN_URL is not configured');
  }

  const body = {
    system: 'You are a careful educational content generator.',
    instruction: [
      'Generate concise, high-quality starter questions for the given leaf subcategory.',
      'Return ONLY raw JSON: {"questions": ["q1", ...]} — do not include markdown.',
      'Questions must be in the requested language. No numbering, just plain text.',
      'Prefer simple, unambiguous phrasing. No extra commentary.',
    ].join(' '),
    input: {
      language: req.language,
      categoryName: req.categoryName,
      categoryPath: req.categoryPath || [],
      minCount: req.minCount,
      maxCount: req.maxCount,
    },
  };

  try {
    const res = await fetch(GEN_CONFIG.GPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(GEN_CONFIG.GPT_KEY ? { Authorization: `Bearer ${GEN_CONFIG.GPT_KEY}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GPT API error ${res.status}: ${text}`);
    }

    const data = await res.json();
    
    // Tolerate either nested or flat responses
    const questions = data?.questions || data?.output?.questions || data?.choices?.[0]?.message?.content || [];
    
    // If the response is a string (OpenAI format), try to parse it
    let parsedQuestions = questions;
    if (typeof questions === 'string') {
      try {
        // Remove markdown code blocks if present
        const cleaned = questions.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);
        parsedQuestions = parsed.questions || parsed;
      } catch (e) {
        logError(e, 'parseGPTResponse');
        // If parsing fails, split by newlines as fallback
        parsedQuestions = questions.split('\n').filter((q: string) => q.trim());
      }
    }
    
    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      throw new Error('No questions returned from GPT API');
    }

    return {
      questions: parsedQuestions,
      meta: data?.meta,
      tokensIn: data?.usage?.prompt_tokens,
      tokensOut: data?.usage?.completion_tokens,
      model: data?.model,
    };
  } catch (error) {
    logError(error, `generateQuestions: ${req.categoryName}`);
    throw error;
  }
}

/**
 * Test the GPT API connection
 * Returns true if the API is reachable and configured
 */
export async function testGPTConnection(): Promise<{ success: boolean; error?: string }> {
  if (!GEN_CONFIG.GPT_URL) {
    return { success: false, error: 'GPT_GEN_URL not configured' };
  }

  try {
    const response = await generateQuestions({
      categoryName: 'Test Category',
      language: 'en',
      minCount: 1,
      maxCount: 2,
    });

    if (response.questions.length > 0) {
      return { success: true };
    }

    return { success: false, error: 'No questions returned' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

