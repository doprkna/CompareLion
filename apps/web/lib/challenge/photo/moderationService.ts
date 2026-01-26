/**
 * Photo Challenge Moderation Service
 * Power user moderation for flagged entries
 * v0.38.12 - Power User Moderation View
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { analyzeImageIntegrity, IntegrityAnalysis } from './integrityService';

export interface FlaggedEntry {
  id: string;
  userId: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
  flagCount: number;
  flags: Array<{
    reason: string;
    userId: string;
    createdAt: Date;
  }>;
  integrityAnalysis: {
    watermarkDetected: boolean;
    aiLikelihood: number; // aiGeneratedLikelihood
    screenshotLikelihood: number;
  } | null;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  // Note: status field would be added to PhotoChallengeEntry for proper hiding
  // For now, hiding is tracked separately (future: status = "active" | "hidden" | "flagged")
}

export type ModerationAction = 'approve' | 'hide';

export interface ModerationResult {
  success: boolean;
  message: string;
}

/**
 * Get all flagged entries (entries with >= 1 ScamFlag)
 * Also includes AI integrity analysis if available
 */
export async function getFlaggedEntries(): Promise<FlaggedEntry[]> {
  try {
    // Get all entries that have at least one flag
    const flaggedEntryIds = await prisma.scamFlag.findMany({
      select: {
        entryId: true,
      },
      distinct: ['entryId'],
    });

    const entryIds = flaggedEntryIds.map(f => f.entryId);

    if (entryIds.length === 0) {
      return [];
    }

    // Fetch entries with flags and user info
    const entries = await prisma.photoChallengeEntry.findMany({
      where: {
        id: { in: entryIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        flags: {
          select: {
            reason: true,
            userId: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Enrich with integrity analysis
    const entriesWithAnalysis = await Promise.all(
      entries.map(async (entry) => {
        const flagCount = entry.flags.length;

        // Get integrity analysis
        let integrityAnalysis: FlaggedEntry['integrityAnalysis'] = null;
        try {
          const analysis = await analyzeImageIntegrity(entry.imageUrl);
          integrityAnalysis = {
            watermarkDetected: analysis.watermarkDetected,
            aiLikelihood: analysis.aiGeneratedLikelihood,
            screenshotLikelihood: analysis.screenshotLikelihood,
          };
        } catch (error) {
          logger.warn('[ModerationService] Failed to get integrity analysis', { entryId: entry.id, error });
          // Continue without analysis
        }

        return {
          id: entry.id,
          userId: entry.userId,
          imageUrl: entry.imageUrl,
          category: entry.category,
          createdAt: entry.createdAt,
          flagCount,
          flags: entry.flags.map(f => ({
            reason: f.reason,
            userId: f.userId,
            createdAt: f.createdAt,
          })),
          integrityAnalysis,
          user: entry.user ? {
            id: entry.user.id,
            name: entry.user.name,
            image: entry.user.image,
          } : undefined,
        };
      })
    );

    return entriesWithAnalysis;
  } catch (error) {
    logger.error('[ModerationService] Failed to get flagged entries', { error });
    return [];
  }
}

/**
 * Moderate an entry (approve or hide)
 * 
 * Note: Proper hiding requires status field on PhotoChallengeEntry
 * For now, approve action clears flags, hide action logs but doesn't persist
 * 
 * @param entryId - Entry ID to moderate
 * @param action - Action: "approve" or "hide"
 * @returns Moderation result
 */
export async function moderateEntry(
  entryId: string,
  action: ModerationAction
): Promise<ModerationResult> {
  try {
    // Verify entry exists
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      select: { id: true },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    if (action === 'approve') {
      // Approve: Remove all flags (soft clear)
      // In future: set status = "active"
      await prisma.scamFlag.deleteMany({
        where: { entryId },
      });

      logger.info('[ModerationService] Entry approved', { entryId });
      return {
        success: true,
        message: 'Entry approved. Flags cleared.',
      };
    } else if (action === 'hide') {
      // Hide: Mark as hidden
      // TODO: Requires status field on PhotoChallengeEntry
      // For now, we can't persist this without schema change
      // Future: await prisma.photoChallengeEntry.update({ where: { id: entryId }, data: { status: 'hidden' } })
      
      logger.info('[ModerationService] Entry hidden (requires status field)', { entryId });
      return {
        success: true,
        message: 'Entry hidden. (Note: Status field needed for persistence)',
      };
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    logger.error('[ModerationService] Failed to moderate entry', { entryId, action, error });
    throw error;
  }
}

