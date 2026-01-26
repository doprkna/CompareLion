/**
 * AURE Assist Engine - Screenshot Scraper Service
 * Analyzes screenshots and suggests actions
 * v0.39.3 - AURE Assist Engine
 */

import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';

export interface ScreenshotAnalysis {
  description: string;
  contextGuess: string;
  suggestedActions: string[];
}

/**
 * Analyze screenshot and suggest actions
 * AI describes what's in the screenshot and suggests what to do with it
 */
export async function analyzeScreenshot(imageUrl: string): Promise<ScreenshotAnalysis> {
  // Check if AI is configured
  if (!GEN_CONFIG.GPT_URL || !GEN_CONFIG.GPT_KEY) {
    // Fallback response
    return {
      description: 'Screenshot analysis is not available at this time.',
      contextGuess: 'Unable to determine context',
      suggestedActions: [
        'Save this as reference',
        'Rate this via AURE',
        'Ignore / archive',
      ],
    };
  }

  try {
    const systemPrompt = `You are a screenshot analyzer for AURE (AI Universal Rating Engine).
Analyze screenshots and provide:
1. A brief description (1-2 sentences) of what's in the screenshot
2. Context guess (chat? app? settings? website? document?)
3. 2-3 suggested actions the user might want to take

Keep suggestions practical and relevant.`;

    const userPrompt = `Analyze this screenshot: ${imageUrl}

Provide:
1. Description (1-2 sentences)
2. Context guess
3. 2-3 suggested actions (e.g., "Save this as reference", "Turn this into a task", "Rate this via AURE (category suggestion)", "Ignore / archive")

Return JSON:
{
  "description": "...",
  "contextGuess": "...",
  "suggestedActions": ["...", "...", "..."]
}`;

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
        temperature: 0.7,
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

    // Parse JSON (may be wrapped in markdown)
    let parsed: any;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate structure
    if (!parsed.description || !Array.isArray(parsed.suggestedActions)) {
      throw new Error('Invalid screenshot analysis structure');
    }

    return {
      description: parsed.description,
      contextGuess: parsed.contextGuess || 'Unable to determine context',
      suggestedActions: parsed.suggestedActions.slice(0, 3), // Max 3 actions
    };
  } catch (error) {
    logger.warn('[AURE Assist] AI screenshot analysis failed, using fallback', { error });
    return {
      description: 'Unable to analyze screenshot at this time.',
      contextGuess: 'Unknown',
      suggestedActions: [
        'Save this as reference',
        'Rate this via AURE',
        'Ignore / archive',
      ],
    };
  }
}

