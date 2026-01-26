/**
 * Image Integrity Check Service
 * AI-powered image integrity analysis
 * v0.38.6 - Image Integrity Check + Scam Alert
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { GEN_CONFIG } from '@parel/core/config/generator';

export interface IntegrityAnalysis {
  watermarkDetected: boolean;
  stockPhotoLikelihood: number; // 0-100
  aiGeneratedLikelihood: number; // 0-100
  screenshotLikelihood: number; // 0-100
  notes: string;
}

/**
 * Analyze image integrity using AI
 * Detects watermarks, stock photos, AI-generated patterns, screenshots
 * 
 * @param imageUrl - URL to the image
 * @returns Integrity analysis results
 */
export async function analyzeImageIntegrity(imageUrl: string): Promise<IntegrityAnalysis> {
  try {
    // Try AI analysis if configured
    if (GEN_CONFIG.GPT_URL && GEN_CONFIG.GPT_KEY) {
      try {
        const analysis = await callAIForIntegrity(imageUrl);
        return analysis;
      } catch (error) {
        logger.warn('[IntegrityService] AI analysis failed, using fallback', { imageUrl, error });
        // Fall through to placeholder
      }
    }

    // Fallback: return neutral analysis
    return {
      watermarkDetected: false,
      stockPhotoLikelihood: 0,
      aiGeneratedLikelihood: 0,
      screenshotLikelihood: 0,
      notes: 'Analysis unavailable',
    };
  } catch (error) {
    logger.error('[IntegrityService] Failed to analyze image integrity', { imageUrl, error });
    throw error;
  }
}

/**
 * Call AI API to analyze image integrity
 */
async function callAIForIntegrity(imageUrl: string): Promise<IntegrityAnalysis> {
  const systemPrompt = `You are an image integrity analyzer. Analyze images for watermarks, stock photo characteristics, AI-generated patterns, and screenshot artifacts. Be factual and concise.`;

  const userPrompt = `Analyze this image: ${imageUrl}

Check for:
1. Watermarks (Shutterstock, Getty, iStock, Canva, Adobe Stock, etc.)
2. Stock photo characteristics (professional lighting, staged composition, generic subjects)
3. AI-generated patterns (Midjourney, DALL-E, Stable Diffusion artifacts)
4. Screenshot artifacts (crop marks, UI elements, browser chrome, etc.)

Return JSON format:
{
  "watermarkDetected": true/false,
  "stockPhotoLikelihood": 0-100,
  "aiGeneratedLikelihood": 0-100,
  "screenshotLikelihood": 0-100,
  "notes": "Brief description of findings, e.g. 'Shutterstock watermark detected' or 'Likely Midjourney generation'"
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
      temperature: 0.3,
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

  // Try to parse JSON (may be wrapped in markdown)
  let parsed: IntegrityAnalysis;
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }

  // Validate structure
  if (
    typeof parsed.watermarkDetected !== 'boolean' ||
    typeof parsed.stockPhotoLikelihood !== 'number' ||
    typeof parsed.aiGeneratedLikelihood !== 'number' ||
    typeof parsed.screenshotLikelihood !== 'number' ||
    !parsed.notes
  ) {
    throw new Error('Invalid integrity analysis structure');
  }

  // Clamp values to 0-100
  parsed.stockPhotoLikelihood = Math.max(0, Math.min(100, parsed.stockPhotoLikelihood));
  parsed.aiGeneratedLikelihood = Math.max(0, Math.min(100, parsed.aiGeneratedLikelihood));
  parsed.screenshotLikelihood = Math.max(0, Math.min(100, parsed.screenshotLikelihood));

  return parsed;
}

/**
 * Generate playful system message based on integrity analysis
 */
export function generatePlayfulMessage(analysis: IntegrityAnalysis): string {
  const { watermarkDetected, stockPhotoLikelihood, aiGeneratedLikelihood, screenshotLikelihood, notes } = analysis;

  if (watermarkDetected) {
    return `Shutterstock watermark detected, my dude. ${notes}`;
  }

  if (stockPhotoLikelihood > 70) {
    return `This looks ${stockPhotoLikelihood}% like a stock photo. ${notes}`;
  }

  if (aiGeneratedLikelihood > 70) {
    return `This looks ${aiGeneratedLikelihood}% like an AI-generated image. ${notes}`;
  }

  if (screenshotLikelihood > 70) {
    return `This looks like a screenshot. ${notes}`;
  }

  if (stockPhotoLikelihood > 50) {
    return `Your 'homemade' photo seems to live on Pinterest. ${notes}`;
  }

  if (aiGeneratedLikelihood > 50) {
    return `Bro... that's literally AI-generated. ${notes}`;
  }

  return notes || 'Image looks legit!';
}

