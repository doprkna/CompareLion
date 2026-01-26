/**
 * Adventure Engine
 * Linear progression system with nodes
 * v0.36.16 - Adventure Mode v0.1
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export interface AdventureNodeDTO {
  id: string;
  stage: number;
  type: 'fight' | 'reward' | 'shop' | 'event';
  data: any;
}

export interface AdventureState {
  runId: string;
  currentStage: number;
  currentNode: AdventureNodeDTO | null;
  isFinished: boolean;
  totalStages: number;
}

const MAX_STAGE = 10; // Chapter 1 has 10 nodes

/**
 * Get current node for user's active adventure run
 */
export async function getCurrentNode(userId: string): Promise<AdventureState | null> {
  try {
    const run = await prisma.adventureRun.findFirst({
      where: {
        userId,
        active: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!run) {
      return null; // No active run
    }

    if (run.stage > MAX_STAGE) {
      // Run is finished
      return {
        runId: run.id,
        currentStage: run.stage,
        currentNode: null,
        isFinished: true,
        totalStages: MAX_STAGE,
      };
    }

    const node = await prisma.adventureNode.findFirst({
      where: {
        stage: run.stage,
      },
    });

    if (!node) {
      logger.warn(`[Adventure] Node not found for stage ${run.stage}`);
      return {
        runId: run.id,
        currentStage: run.stage,
        currentNode: null,
        isFinished: false,
        totalStages: MAX_STAGE,
      };
    }

    return {
      runId: run.id,
      currentStage: run.stage,
      currentNode: {
        id: node.id,
        stage: node.stage,
        type: node.type as 'fight' | 'reward' | 'shop' | 'event',
        data: typeof node.data === 'string' ? JSON.parse(node.data) : node.data,
      },
      isFinished: false,
      totalStages: MAX_STAGE,
    };
  } catch (error) {
    logger.error('[Adventure] Error getting current node', error);
    return null;
  }
}

/**
 * Start a new adventure run
 * Creates new run at stage 1 if no active run exists
 */
export async function startAdventure(userId: string): Promise<AdventureState> {
  try {
    // Check for existing active run
    const existingRun = await prisma.adventureRun.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (existingRun) {
      // Return existing run's current node
      const state = await getCurrentNode(userId);
      if (state) {
        return state;
      }
    }

    // Create new run
    const run = await prisma.adventureRun.create({
      data: {
        userId,
        stage: 1,
        active: true,
      },
    });

    // Get first node
    const node = await prisma.adventureNode.findFirst({
      where: {
        stage: 1,
      },
    });

    if (!node) {
      throw new Error('Adventure node 1 not found. Please seed nodes first.');
    }

    return {
      runId: run.id,
      currentStage: 1,
      currentNode: {
        id: node.id,
        stage: node.stage,
        type: node.type as 'fight' | 'reward' | 'shop' | 'event',
        data: typeof node.data === 'string' ? JSON.parse(node.data) : node.data,
      },
      isFinished: false,
      totalStages: MAX_STAGE,
    };
  } catch (error) {
    logger.error('[Adventure] Error starting adventure', error);
    throw error;
  }
}

/**
 * Advance to next stage
 * Increments stage, marks as finished if past max
 */
export async function advanceAdventure(userId: string): Promise<AdventureState | null> {
  try {
    const run = await prisma.adventureRun.findFirst({
      where: {
        userId,
        active: true,
      },
    });

    if (!run) {
      throw new Error('No active adventure run found');
    }

    const nextStage = run.stage + 1;

    if (nextStage > MAX_STAGE) {
      // Mark run as finished
      await prisma.adventureRun.update({
        where: { id: run.id },
        data: { active: false },
      });

      return {
        runId: run.id,
        currentStage: nextStage,
        currentNode: null,
        isFinished: true,
        totalStages: MAX_STAGE,
      };
    }

    // Advance to next stage
    await prisma.adventureRun.update({
      where: { id: run.id },
      data: { stage: nextStage },
    });

    // Get next node
    const node = await prisma.adventureNode.findFirst({
      where: {
        stage: nextStage,
      },
    });

    if (!node) {
      logger.warn(`[Adventure] Node not found for stage ${nextStage}`);
      return {
        runId: run.id,
        currentStage: nextStage,
        currentNode: null,
        isFinished: false,
        totalStages: MAX_STAGE,
      };
    }

    return {
      runId: run.id,
      currentStage: nextStage,
      currentNode: {
        id: node.id,
        stage: node.stage,
        type: node.type as 'fight' | 'reward' | 'shop' | 'event',
        data: typeof node.data === 'string' ? JSON.parse(node.data) : node.data,
      },
      isFinished: false,
      totalStages: MAX_STAGE,
    };
  } catch (error) {
    logger.error('[Adventure] Error advancing adventure', error);
    throw error;
  }
}

/**
 * Reset adventure run
 * Deactivates current run and creates new one
 */
export async function resetAdventure(userId: string): Promise<AdventureState> {
  try {
    // Deactivate all active runs
    await prisma.adventureRun.updateMany({
      where: {
        userId,
        active: true,
      },
      data: {
        active: false,
      },
    });

    // Create new run
    return await startAdventure(userId);
  } catch (error) {
    logger.error('[Adventure] Error resetting adventure', error);
    throw error;
  }
}

/**
 * Get all nodes for display (map view)
 */
export async function getAllNodes(): Promise<AdventureNodeDTO[]> {
  try {
    const nodes = await prisma.adventureNode.findMany({
      orderBy: {
        stage: 'asc',
      },
    });

    return nodes.map(node => ({
      id: node.id,
      stage: node.stage,
      type: node.type as 'fight' | 'reward' | 'shop' | 'event',
      data: typeof node.data === 'string' ? JSON.parse(node.data) : node.data,
    }));
  } catch (error) {
    logger.error('[Adventure] Error getting all nodes', error);
    return [];
  }
}

