/**
 * Scam Flag Service
 * Handle scam flagging for photo challenge entries
 * v0.38.6 - Image Integrity Check + Scam Alert
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { analyzeImageIntegrity, generatePlayfulMessage } from './integrityService';

export type ScamFlagReason = 'watermark' | 'stock' | 'ai' | 'meme' | 'other';

export interface ScamFlagResult {
  success: boolean;
  message: string;
  flagCount: number;
}

/**
 * Flag an entry as scam
 * 
 * @param userId - User ID flagging the entry
 * @param entryId - Entry ID to flag
 * @param reason - Reason for flagging
 * @returns Result with playful message and flag count
 */
export async function flagScam(
  userId: string,
  entryId: string,
  reason: ScamFlagReason
): Promise<ScamFlagResult> {
  try {
    // Verify entry exists
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      select: { id: true, imageUrl: true },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Check if user already flagged this entry
    const existingFlag = await prisma.scamFlag.findUnique({
      where: {
        entryId_userId: {
          entryId,
          userId,
        },
      },
    });

    if (existingFlag) {
      // User already flagged, return current flag count
      const flagCount = await prisma.scamFlag.count({
        where: { entryId },
      });

      return {
        success: true,
        message: 'You already flagged this entry.',
        flagCount,
      };
    }

    // Create flag
    await prisma.scamFlag.create({
      data: {
        entryId,
        userId,
        reason,
      },
    });

    // Get flag count
    const flagCount = await prisma.scamFlag.count({
      where: { entryId },
    });

    // Optionally run AI integrity check if not cached
    // For now, generate playful message based on reason
    let message: string;
    switch (reason) {
      case 'watermark':
        message = 'Shutterstock watermark detected, my dude.';
        break;
      case 'stock':
        message = 'This looks like a stock photo. Your "homemade" snack seems to live on Pinterest.';
        break;
      case 'ai':
        message = 'Bro... that\'s literally AI-generated.';
        break;
      case 'meme':
        message = 'This looks like a meme crop.';
        break;
      default:
        message = 'Flagged for review.';
    }

    // Try to enhance message with AI analysis if available
    try {
      const analysis = await analyzeImageIntegrity(entry.imageUrl);
      message = generatePlayfulMessage(analysis);
    } catch (error) {
      // Use reason-based message if AI fails
      logger.warn('[ScamFlagService] AI analysis failed, using reason-based message', { entryId, error });
    }

    return {
      success: true,
      message,
      flagCount,
    };
  } catch (error: any) {
    // Handle unique constraint violation (shouldn't happen due to check, but safety)
    if (error.code === 'P2002') {
      const flagCount = await prisma.scamFlag.count({
        where: { entryId },
      });
      return {
        success: true,
        message: 'You already flagged this entry.',
        flagCount,
      };
    }

    logger.error('[ScamFlagService] Failed to flag scam', { userId, entryId, reason, error });
    throw error;
  }
}

/**
 * Get integrity analysis and flag count for an entry
 * 
 * @param entryId - Entry ID
 * @returns Integrity analysis and flag count
 */
export async function getIntegrityData(entryId: string): Promise<{
  analysis: {
    watermarkDetected: boolean;
    stockPhotoLikelihood: number;
    aiGeneratedLikelihood: number;
    screenshotLikelihood: number;
    notes: string;
  } | null;
  flagCount: number;
}> {
  try {
    // Verify entry exists
    const entry = await prisma.photoChallengeEntry.findUnique({
      where: { id: entryId },
      select: { id: true, imageUrl: true },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Get flag count
    const flagCount = await prisma.scamFlag.count({
      where: { entryId },
    });

    // Get integrity analysis (can be cached in future)
    let analysis = null;
    try {
      analysis = await analyzeImageIntegrity(entry.imageUrl);
    } catch (error) {
      logger.warn('[ScamFlagService] Failed to get integrity analysis', { entryId, error });
    }

    return {
      analysis,
      flagCount,
    };
  } catch (error) {
    logger.error('[ScamFlagService] Failed to get integrity data', { entryId, error });
    throw error;
  }
}

