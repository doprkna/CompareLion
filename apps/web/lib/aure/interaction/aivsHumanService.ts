/**
 * AURE Interaction Engine - AI vs Human Service
 * Compares AI picks vs human votes
 * v0.39.2 - AURE Interaction Engine
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getRatingResult } from '@/lib/rating/ratingService';

export interface AiHumanBattle {
  id: string;
  leftRequestId: string;
  rightRequestId: string;
  aiWinner: 'left' | 'right';
  humanVotesA: number;
  humanVotesB: number;
  createdAt: Date;
}

export interface BattleOutcome {
  battle: AiHumanBattle;
  userAgreement: 'match' | 'mismatch' | 'not_voted';
  aiChoice: 'left' | 'right';
  humanChoice: 'left' | 'right' | null;
}

/**
 * Create AI vs Human battle
 * AI picks winner, humans vote
 */
export async function createAiHumanBattle(
  leftRequestId: string,
  rightRequestId: string
): Promise<AiHumanBattle> {
  try {
    // Get rating results for both requests
    const [leftResult, rightResult] = await Promise.all([
      getRatingResult(leftRequestId),
      getRatingResult(rightRequestId),
    ]);

    // AI picks winner based on total score
    const leftScore = Object.values(leftResult.metrics).reduce((a, b) => a + b, 0);
    const rightScore = Object.values(rightResult.metrics).reduce((a, b) => a + b, 0);
    const aiWinner = leftScore > rightScore ? 'left' : 'right';

    // Create battle
    try {
      const battle = await prisma.aiHumanBattle.create({
        data: {
          leftRequestId,
          rightRequestId,
          aiWinner,
          humanVotesA: 0,
          humanVotesB: 0,
        },
      });

      return {
        id: battle.id,
        leftRequestId: battle.leftRequestId,
        rightRequestId: battle.rightRequestId,
        aiWinner: battle.aiWinner as 'left' | 'right',
        humanVotesA: battle.humanVotesA,
        humanVotesB: battle.humanVotesB,
        createdAt: battle.createdAt,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return placeholder
      if (error.message?.includes('model') || error.message?.includes('AiHumanBattle')) {
        logger.warn('[AURE Interaction] AiHumanBattle model not found - Prisma migration required');
        return {
          id: 'placeholder',
          leftRequestId,
          rightRequestId,
          aiWinner,
          humanVotesA: 0,
          humanVotesB: 0,
          createdAt: new Date(),
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to create AI vs Human battle', {
      error,
      leftRequestId,
      rightRequestId,
    });
    throw error;
  }
}

/**
 * Vote on AI vs Human battle
 */
export async function voteOnAiHumanBattle(
  userId: string,
  battleId: string,
  choice: 'left' | 'right'
): Promise<{ success: boolean; outcome: BattleOutcome }> {
  try {
    // Get battle
    let battle: AiHumanBattle;
    try {
      const dbBattle = await prisma.aiHumanBattle.findUnique({
        where: { id: battleId },
      });

      if (!dbBattle) {
        throw new Error('Battle not found');
      }

      battle = {
        id: dbBattle.id,
        leftRequestId: dbBattle.leftRequestId,
        rightRequestId: dbBattle.rightRequestId,
        aiWinner: dbBattle.aiWinner as 'left' | 'right',
        humanVotesA: dbBattle.humanVotesA,
        humanVotesB: dbBattle.humanVotesB,
        createdAt: dbBattle.createdAt,
      };
    } catch (error: any) {
      if (error.message?.includes('model') || error.message?.includes('AiHumanBattle')) {
        throw new Error('Battle model not found - Prisma migration required');
      }
      throw error;
    }

    // Check if user already voted
    try {
      const existingVote = await prisma.aiHumanVote.findUnique({
        where: {
          battleId_userId: {
            battleId,
            userId,
          },
        },
      });

      if (existingVote) {
        throw new Error('Already voted');
      }

      // Create vote
      await prisma.aiHumanVote.create({
        data: {
          battleId,
          userId,
          choice,
        },
      });

      // Update battle vote counts
      await prisma.aiHumanBattle.update({
        where: { id: battleId },
        data: {
          humanVotesA: choice === 'left' ? { increment: 1 } : undefined,
          humanVotesB: choice === 'right' ? { increment: 1 } : undefined,
        },
      });

      // Get updated battle
      const updatedBattle = await prisma.aiHumanBattle.findUnique({
        where: { id: battleId },
      });

      if (updatedBattle) {
        battle = {
          id: updatedBattle.id,
          leftRequestId: updatedBattle.leftRequestId,
          rightRequestId: updatedBattle.rightRequestId,
          aiWinner: updatedBattle.aiWinner as 'left' | 'right',
          humanVotesA: updatedBattle.humanVotesA,
          humanVotesB: updatedBattle.humanVotesB,
          createdAt: updatedBattle.createdAt,
        };
      }
    } catch (error: any) {
      if (error.message?.includes('model') || error.message?.includes('AiHumanVote')) {
        logger.warn('[AURE Interaction] AiHumanVote model not found - Prisma migration required');
        // Continue with placeholder logic
      } else if (error.message === 'Already voted') {
        throw error;
      } else {
        throw error;
      }
    }

    // Determine outcome
    const userAgreement: 'match' | 'mismatch' | 'not_voted' =
      choice === battle.aiWinner ? 'match' : 'mismatch';

    const outcome: BattleOutcome = {
      battle,
      userAgreement,
      aiChoice: battle.aiWinner,
      humanChoice: choice,
    };

    return {
      success: true,
      outcome,
    };
  } catch (error) {
    logger.error('[AURE Interaction] Failed to vote on AI vs Human battle', {
      error,
      userId,
      battleId,
      choice,
    });
    throw error;
  }
}

/**
 * Get battle outcome for user
 */
export async function getBattleOutcome(
  userId: string,
  battleId: string
): Promise<BattleOutcome | null> {
  try {
    const battle = await prisma.aiHumanBattle.findUnique({
      where: { id: battleId },
    });

    if (!battle) {
      return null;
    }

    const userVote = await prisma.aiHumanVote.findUnique({
      where: {
        battleId_userId: {
          battleId,
          userId,
        },
      },
    });

    const battleData: AiHumanBattle = {
      id: battle.id,
      leftRequestId: battle.leftRequestId,
      rightRequestId: battle.rightRequestId,
      aiWinner: battle.aiWinner as 'left' | 'right',
      humanVotesA: battle.humanVotesA,
      humanVotesB: battle.humanVotesB,
      createdAt: battle.createdAt,
    };

    const userAgreement: 'match' | 'mismatch' | 'not_voted' = userVote
      ? userVote.choice === battle.aiWinner
        ? 'match'
        : 'mismatch'
      : 'not_voted';

    return {
      battle: battleData,
      userAgreement,
      aiChoice: battle.aiWinner,
      humanChoice: userVote ? (userVote.choice as 'left' | 'right') : null,
    };
  } catch (error: any) {
    if (error.message?.includes('model')) {
      logger.warn('[AURE Interaction] Battle models not found - Prisma migration required');
      return null;
    }
    logger.error('[AURE Interaction] Failed to get battle outcome', { error, userId, battleId });
    return null;
  }
}

