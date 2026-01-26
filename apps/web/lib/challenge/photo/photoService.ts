/**
 * Photo Challenge Service
 * Handle photo challenge entries, votes, and scoring
 * v0.37.12 - Photo Challenge
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { saveImageFile, validateImageFile } from './photoUpload';

export interface PhotoEntry {
  id: string;
  userId: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  appealScore?: number;
  creativityScore?: number;
  userVotes?: {
    appeal: boolean;
    creativity: boolean;
  };
}

export interface VoteResult {
  success: boolean;
  appealScore: number;
  creativityScore: number;
  userVotes: {
    appeal: boolean;
    creativity: boolean;
  };
  error?: string;
}

/**
 * Upload and save photo file
 * 
 * @param file - File object from FormData
 * @param userId - User ID
 * @returns Public URL path to saved file
 */
export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file');
  }

  return await saveImageFile(file, userId);
}

/**
 * Submit photo to challenge
 * 
 * @param userId - User ID
 * @param imageUrl - URL to uploaded image
 * @param category - Challenge category
 * @returns Created entry
 */
export async function submitToChallenge(
  userId: string,
  imageUrl: string,
  category: string
): Promise<PhotoEntry> {
  try {
    const entry = await prisma.photoChallengeEntry.create({
      data: {
        userId,
        imageUrl,
        category,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return {
      id: entry.id,
      userId: entry.userId,
      imageUrl: entry.imageUrl,
      category: entry.category,
      createdAt: entry.createdAt,
      user: entry.user ? {
        id: entry.user.id,
        name: entry.user.name,
        image: entry.user.image,
      } : undefined,
    };
  } catch (error) {
    logger.error('[PhotoService] Failed to submit entry', { userId, imageUrl, category, error });
    throw new Error('Failed to submit photo to challenge');
  }
}

/**
 * Vote on a photo entry
 * 
 * @param userId - User ID
 * @param entryId - Entry ID
 * @param voteType - Vote type: 'appeal' or 'creativity'
 * @returns Vote result with scores
 */
export async function voteOnEntry(
  userId: string,
  entryId: string,
  voteType: 'appeal' | 'creativity'
): Promise<VoteResult> {
  try {
    // Verify entry exists
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      select: { id: true },
    });

    if (!entry) {
      return {
        success: false,
        appealScore: 0,
        creativityScore: 0,
        userVotes: { appeal: false, creativity: false },
        error: 'Entry not found',
      };
    }

    // Check existing vote
    const existingVote = await prisma.photoVote.findUnique({
      where: {
        entryId_userId_voteType: {
          entryId,
          userId,
          voteType,
        },
      },
    });

    if (existingVote) {
      // Toggle off - remove vote
      await prisma.photoVote.delete({
        where: {
          entryId_userId_voteType: {
            entryId,
            userId,
            voteType,
          },
        },
      });
    } else {
      // Create new vote
      await prisma.photoVote.create({
        data: {
          entryId,
          userId,
          voteType,
        },
      });
    }

    // Compute scores
    const [appealScore, creativityScore, userVotes] = await Promise.all([
      computeScore(entryId, 'appeal'),
      computeScore(entryId, 'creativity'),
      getUserVotes(userId, entryId),
    ]);

    return {
      success: true,
      appealScore,
      creativityScore,
      userVotes,
    };
  } catch (error) {
    logger.error('[PhotoService] Failed to vote on entry', {
      userId,
      entryId,
      voteType,
      error,
    });

    return {
      success: false,
      appealScore: 0,
      creativityScore: 0,
      userVotes: { appeal: false, creativity: false },
      error: 'Failed to vote',
    };
  }
}

/**
 * Compute score for an entry and vote type
 * 
 * @param entryId - Entry ID
 * @param voteType - Vote type: 'appeal' or 'creativity'
 * @returns Score (count of votes)
 */
export async function computeScore(
  entryId: string,
  voteType: 'appeal' | 'creativity'
): Promise<number> {
  try {
    const count = await prisma.photoVote.count({
      where: {
        entryId,
        voteType,
      },
    });

    return count;
  } catch (error) {
    logger.error('[PhotoService] Failed to compute score', { entryId, voteType, error });
    return 0;
  }
}

/**
 * Get user's votes for an entry
 * 
 * @param userId - User ID
 * @param entryId - Entry ID
 * @returns User vote state
 */
async function getUserVotes(
  userId: string,
  entryId: string
): Promise<{ appeal: boolean; creativity: boolean }> {
  try {
    const votes = await prisma.photoVote.findMany({
      where: {
        entryId,
        userId,
      },
      select: {
        voteType: true,
      },
    });

    return {
      appeal: votes.some(v => v.voteType === 'appeal'),
      creativity: votes.some(v => v.voteType === 'creativity'),
    };
  } catch (error) {
    logger.error('[PhotoService] Failed to get user votes', { userId, entryId, error });
    return { appeal: false, creativity: false };
  }
}

/**
 * Get challenge entries by category
 * 
 * @param category - Challenge category (optional)
 * @param userId - User ID for vote state (optional)
 * @returns List of entries with scores
 */
export async function getChallengeEntries(
  category?: string,
  userId?: string
): Promise<PhotoEntry[]> {
  try {
    const entries = await prisma.photoChallengeEntry.findMany({
      where: category ? { category } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Compute scores and user votes for each entry
    const entriesWithScores = await Promise.all(
      entries.map(async (entry) => {
        const [appealScore, creativityScore, userVotes] = await Promise.all([
          computeScore(entry.id, 'appeal'),
          computeScore(entry.id, 'creativity'),
          userId ? getUserVotes(userId, entry.id) : Promise.resolve({ appeal: false, creativity: false }),
        ]);

        return {
          id: entry.id,
          userId: entry.userId,
          imageUrl: entry.imageUrl,
          category: entry.category,
          createdAt: entry.createdAt,
          user: entry.user ? {
            id: entry.user.id,
            name: entry.user.name,
            image: entry.user.image,
          } : undefined,
          appealScore,
          creativityScore,
          userVotes: userId ? userVotes : undefined,
        };
      })
    );

    return entriesWithScores;
  } catch (error) {
    logger.error('[PhotoService] Failed to get challenge entries', { category, error });
    return [];
  }
}

