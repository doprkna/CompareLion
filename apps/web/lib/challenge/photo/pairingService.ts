/**
 * Photo Challenge Snack Pairing Service
 * Generate AI snack pairing suggestions (stub)
 * v0.37.13 - AI Snack Pairing
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { cache } from '@/lib/cache';

export interface SnackPairing {
  pairing: string[];
  healthierAlternative: string | null;
  cached: boolean;
}

/**
 * Generate snack pairing suggestions for a photo entry
 * Stub implementation - returns placeholder suggestions for now
 * 
 * @param entryId - Entry ID
 * @returns Pairing suggestions with healthier alternative
 */
export async function generateSnackPairing(entryId: string): Promise<SnackPairing> {
  try {
    // Check cache first (Redis if available, otherwise in-memory)
    const cacheKey = `pairing:${entryId}`;
    const cached = cache.get<SnackPairing>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
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
    // For now, return placeholder suggestions based on category
    // Future: Call AI API with image URL + category
    // Prompt: "Suggest a complementary drink or side for this snack. Optionally suggest a healthier alternative."
    
    const categoryPairings: Record<string, { pairing: string[]; healthierAlternative: string }> = {
      healthy: {
        pairing: [
          'Pair with green tea or sparkling water',
          'Add fresh fruit slices on the side',
          'Try with a light yogurt dip',
        ],
        healthierAlternative: 'Consider adding more vegetables for extra fiber',
      },
      weird: {
        pairing: [
          'Try with a bold-flavored drink like kombucha',
          'Pair with something crunchy for texture contrast',
          'Experiment with a spicy dipping sauce',
        ],
        healthierAlternative: 'Swap for a baked version to reduce calories',
      },
      creative: {
        pairing: [
          'Match with a craft beverage that complements the flavors',
          'Add complementary textures (crispy, creamy, or chewy)',
          'Pair with a contrasting flavor profile',
        ],
        healthierAlternative: 'Use whole grain alternatives where possible',
      },
      speedrun: {
        pairing: [
          'Quick protein shake or smoothie',
          'Pair with pre-cut vegetables for convenience',
          'Grab a ready-to-drink beverage',
        ],
        healthierAlternative: 'Pre-portion snacks to control serving size',
      },
    };

    const defaultPairing = {
      pairing: [
        'Try with your favorite beverage',
        'Add a side for balance',
        'Consider texture contrast',
      ],
      healthierAlternative: 'Look for lower-sugar or whole-grain alternatives',
    };

    const suggestions = categoryPairings[entry.category] || defaultPairing;

    const result: SnackPairing = {
      pairing: suggestions.pairing,
      healthierAlternative: suggestions.healthierAlternative,
      cached: false,
    };

    // Cache for 1-6 hours (randomized to avoid thundering herd)
    const ttl = 3600 + Math.floor(Math.random() * 5 * 3600); // 1-6 hours
    cache.set(cacheKey, result, ttl);

    return result;
  } catch (error) {
    logger.error('[PairingService] Failed to generate pairing', { entryId, error });
    
    // Return fallback suggestions
    return {
      pairing: [
        'Try with your favorite beverage',
        'Add a complementary side',
      ],
      healthierAlternative: 'Consider healthier alternatives',
      cached: false,
    };
  }
}

/**
 * Get snack pairing suggestions (cached or generated)
 * 
 * @param entryId - Entry ID
 * @returns Pairing suggestions
 */
export async function getSnackPairing(entryId: string): Promise<SnackPairing> {
  return await generateSnackPairing(entryId);
}

