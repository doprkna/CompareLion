/**
 * Photo Challenge AI Comment Service
 * Generate fun AI commentary for photo entries (stub)
 * v0.37.12 - Photo Challenge
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';

/**
 * Generate AI comment for a photo entry
 * Stub implementation - returns simple placeholder for now
 * 
 * @param entryId - Entry ID
 * @returns AI-generated comment text
 */
export async function aiCommentForEntry(entryId: string): Promise<string> {
  try {
    // Check cache first (Redis if available, otherwise in-memory)
    const cacheKey = `photo-challenge:ai-comment:${entryId}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch entry with metadata
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // TODO: Implement actual AI call
    // For now, return a simple placeholder comment
    // Future: Call AI API with image URL + metadata
    // Prompt: "Give a fun 1-sentence comment about this snack."
    
    const placeholderComments = [
      "This snack looks absolutely delicious! 🍪",
      "Creative presentation! Love the style! ✨",
      "That's a unique take on snacks! 🎨",
      "Looks like a winner to me! 🏆",
      "Yum! This makes me hungry! 😋",
    ];

    const randomComment = placeholderComments[
      Math.floor(Math.random() * placeholderComments.length)
    ];

    // Cache for 1 hour
    cache.set(cacheKey, randomComment, 3600);

    return randomComment;
  } catch (error) {
    logger.error('[AICommentService] Failed to generate comment', { entryId, error });
    return "This snack looks great!";
  }
}

/**
 * Get cached AI comment or generate new one
 * 
 * @param entryId - Entry ID
 * @returns AI comment text
 */
export async function getAIComment(entryId: string): Promise<string> {
  return await aiCommentForEntry(entryId);
}

