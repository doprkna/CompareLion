/**
 * Draft Review Queue Service
 * Minimal CRUD operations for drafts, boosts, and reviews
 * v0.37.5 - Draft Review Queue + Social Boosting (Placeholder)
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { DraftStatus, ReviewDecision } from './types';

/**
 * Submit/create a draft
 * 
 * @param userId - User ID
 * @param content - Draft content (JSON or string)
 * @returns Created draft ID
 */
export async function submitDraft(
  userId: string,
  content: any
): Promise<{ success: boolean; draftId?: string; error?: string }> {
  try {
    const draft = await prisma.draft.create({
      data: {
        userId,
        content,
        status: DraftStatus.DRAFT,
      },
    });

    logger.debug(`[DraftService] User ${userId} created draft ${draft.id}`);

    return { success: true, draftId: draft.id };
  } catch (error) {
    logger.error('[DraftService] Failed to submit draft', { userId, error });
    return { success: false, error: 'Failed to submit draft' };
  }
}

/**
 * Request review for a draft (change status to pending)
 * 
 * @param userId - User ID (must be draft owner)
 * @param draftId - Draft ID
 * @returns Success result
 */
export async function requestReview(
  userId: string,
  draftId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      select: { userId: true },
    });

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    if (draft.userId !== userId) {
      return { success: false, error: 'Not authorized' };
    }

    await prisma.draft.update({
      where: { id: draftId },
      data: { status: DraftStatus.PENDING },
    });

    logger.debug(`[DraftService] Draft ${draftId} requested for review`);

    return { success: true };
  } catch (error) {
    logger.error('[DraftService] Failed to request review', { draftId, error });
    return { success: false, error: 'Failed to request review' };
  }
}

/**
 * Boost a draft (+1 from user)
 * 
 * @param userId - User ID
 * @param draftId - Draft ID
 * @returns Success result
 */
export async function boostDraft(
  userId: string,
  draftId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if draft exists
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      select: { id: true },
    });

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    // Check if already boosted
    const existing = await prisma.draftBoost.findUnique({
      where: {
        draftId_userId: {
          draftId,
          userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: 'Already boosted' };
    }

    // Create boost
    await prisma.draftBoost.create({
      data: {
        draftId,
        userId,
      },
    });

    logger.debug(`[DraftService] User ${userId} boosted draft ${draftId}`);

    return { success: true };
  } catch (error) {
    logger.error('[DraftService] Failed to boost draft', { draftId, userId, error });
    return { success: false, error: 'Failed to boost draft' };
  }
}

/**
 * Approve a draft (power user action)
 * 
 * @param reviewerId - Reviewer user ID (power user)
 * @param draftId - Draft ID
 * @param comment - Optional comment
 * @returns Success result
 */
export async function approveDraft(
  reviewerId: string,
  draftId: string,
  comment?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      select: { id: true },
    });

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    // Update draft status
    await prisma.draft.update({
      where: { id: draftId },
      data: { status: DraftStatus.APPROVED },
    });

    // Create review record
    await prisma.draftReview.create({
      data: {
        draftId,
        reviewerId,
        decision: ReviewDecision.APPROVED,
        comment: comment || null,
      },
    });

    logger.debug(`[DraftService] Draft ${draftId} approved by ${reviewerId}`);

    return { success: true };
  } catch (error) {
    logger.error('[DraftService] Failed to approve draft', { draftId, reviewerId, error });
    return { success: false, error: 'Failed to approve draft' };
  }
}

/**
 * Reject a draft (power user action)
 * 
 * @param reviewerId - Reviewer user ID (power user)
 * @param draftId - Draft ID
 * @param comment - Optional comment
 * @returns Success result
 */
export async function rejectDraft(
  reviewerId: string,
  draftId: string,
  comment?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      select: { id: true },
    });

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    // Update draft status
    await prisma.draft.update({
      where: { id: draftId },
      data: { status: DraftStatus.REJECTED },
    });

    // Create review record
    await prisma.draftReview.create({
      data: {
        draftId,
        reviewerId,
        decision: ReviewDecision.REJECTED,
        comment: comment || null,
      },
    });

    logger.debug(`[DraftService] Draft ${draftId} rejected by ${reviewerId}`);

    return { success: true };
  } catch (error) {
    logger.error('[DraftService] Failed to reject draft', { draftId, reviewerId, error });
    return { success: false, error: 'Failed to reject draft' };
  }
}

