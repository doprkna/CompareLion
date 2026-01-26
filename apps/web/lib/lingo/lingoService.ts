/**
 * CompareLingo Service 1.0
 * AI-powered language rating system for jokes, slang, captions, etc.
 * v0.40.4 - CompareLingo 1.0 (Slang, Joke, Caption Rating)
 */

import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';

export type LingoMode = 'joke' | 'slang' | 'caption' | 'pickup' | 'meme' | 'msg';

export interface LingoRating {
  scores: {
    humor: number; // 0-100
    clarity: number; // 0-100
    vibe: number; // 0-100
  };
  vibeTag: string;
  lingoType: string;
  feedback: string;
  suggestion?: string;
}

export interface LingoError {
  error: 'unsafe_content' | 'invalid_input' | 'ai_error';
  message?: string;
}

/**
 * Rate text using CompareLingo AI
 */
export async function rateTextLingo(
  text: string,
  mode: LingoMode
): Promise<LingoRating | LingoError> {
  try {
    // Validate input
    if (!text || typeof text !== 'string') {
      return { error: 'invalid_input', message: 'Text is required' };
    }

    if (text.length > 200) {
      return { error: 'invalid_input', message: 'Text must be 200 characters or less' };
    }

    if (text.trim().length === 0) {
      return { error: 'invalid_input', message: 'Text cannot be empty' };
    }

    // Safety guard
    const safetyCheck = checkContentSafety(text);
    if (!safetyCheck.safe) {
      return { error: 'unsafe_content' };
    }

    // Rate using AI
    const rating = await callAIForLingoRating(text, mode);

    return rating;
  } catch (error) {
    logger.error('[CompareLingo] Failed to rate text', { error, text: text.substring(0, 50), mode });
    return { error: 'ai_error', message: 'Failed to rate text' };
  }
}

/**
 * Check content safety (lightweight)
 */
function checkContentSafety(text: string): { safe: boolean; reason?: string } {
  const lowerText = text.toLowerCase();

  // Basic unsafe patterns
  const unsafePatterns = [
    /\b(kill|murder|violence|harm|attack)\b/i,
    /\b(hate|racist|sexist|discriminat)\b/i,
    /\b(bomb|terror|threat)\b/i,
  ];

  for (const pattern of unsafePatterns) {
    if (pattern.test(text)) {
      return { safe: false, reason: 'Contains potentially unsafe content' };
    }
  }

  // Check for excessive profanity (more than 3 instances)
  const profanityCount = (text.match(/\b(fuck|shit|damn|hell)\b/gi) || []).length;
  if (profanityCount > 3) {
    return { safe: false, reason: 'Excessive profanity' };
  }

  return { safe: true };
}

/**
 * Call AI to rate text based on mode
 */
async function callAIForLingoRating(
  text: string,
  mode: LingoMode
): Promise<LingoRating> {
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback rating
    return {
      scores: {
        humor: 50,
        clarity: 70,
        vibe: 60,
      },
      vibeTag: 'Neutral',
      lingoType: 'Standard',
      feedback: 'This text has potential. Keep experimenting!',
    };
  }

  try {
    const systemPrompt = getSystemPromptForMode(mode);
    const userPrompt = getUserPromptForMode(text, mode);

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
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPT API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error('No content from AI');
    }

    // Parse JSON
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate and normalize scores
    const scores = {
      humor: Math.max(0, Math.min(100, Math.round(parsed.scores?.humor || 50))),
      clarity: Math.max(0, Math.min(100, Math.round(parsed.scores?.clarity || 50))),
      vibe: Math.max(0, Math.min(100, Math.round(parsed.scores?.vibe || 50))),
    };

    return {
      scores,
      vibeTag: parsed.vibeTag || 'Neutral',
      lingoType: parsed.lingoType || 'Standard',
      feedback: parsed.feedback || 'This text has potential!',
      suggestion: parsed.suggestion || undefined,
    };
  } catch (error) {
    logger.warn('[CompareLingo] AI rating failed, using fallback', { error });
    return {
      scores: {
        humor: 50,
        clarity: 70,
        vibe: 60,
      },
      vibeTag: 'Neutral',
      lingoType: 'Standard',
      feedback: 'This text has potential. Keep experimenting!',
    };
  }
}

/**
 * Get system prompt for mode
 */
function getSystemPromptForMode(mode: LingoMode): string {
  const prompts: Record<LingoMode, string> = {
    joke: `You are a comedy critic for CompareLingo.
Rate jokes on humor (comedic timing, punchline quality), clarity, and vibe.
Be playful and constructive. Keep feedback 1-2 sentences.`,
    slang: `You are a language vibe detector for CompareLingo.
Rate slang on cultural fit, vibe, and cringe factor.
Identify the lingo type (e.g., "Gen-Z", "Regional", "Meme"). Be playful.`,
    caption: `You are a social media caption rater for CompareLingo.
Rate captions on IG/TikTok style quality, clarity, and vibe.
Keep feedback fun and constructive.`,
    pickup: `You are a pickup line evaluator for CompareLingo.
Rate on cringe vs charm balance, clarity, and vibe.
Be playful and honest.`,
    meme: `You are a meme text rater for CompareLingo.
Rate on meme format alignment, humor, and vibe.
Identify meme type if recognizable.`,
    msg: `You are a message tone detector for CompareLingo.
Rate messages on tone clarity, vibe, and appropriateness.
Keep it light and fun.`,
  };

  return prompts[mode];
}

/**
 * Get user prompt for mode
 */
function getUserPromptForMode(text: string, mode: LingoMode): string {
  const modeNames: Record<LingoMode, string> = {
    joke: 'joke',
    slang: 'slang phrase',
    caption: 'social media caption',
    pickup: 'pickup line',
    meme: 'meme text',
    msg: 'message',
  };

  return `Rate this ${modeNames[mode]}:

"${text}"

Return JSON:
{
  "scores": {
    "humor": 0-100,
    "clarity": 0-100,
    "vibe": 0-100
  },
  "vibeTag": "1-2 words (e.g., 'Cozy Chaos', 'Cringe King', 'Vibe Check')",
  "lingoType": "Type description (e.g., 'Modern Czech / Gen-Z / Meme / Corporate')",
  "feedback": "1-2 sentence playful roast or praise",
  "suggestion": "Optional improvement hint (1 sentence)"
}`;
}

