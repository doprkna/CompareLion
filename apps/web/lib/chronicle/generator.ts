/**
 * Chronicle Generator
 * Compiles weekly world stats from various game systems
 * v0.36.43 - World Chronicle 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { ChronicleStatsSnapshot, ChronicleGenerationInput, ChronicleGenerationResult, XPLeader, FunniestAnswer, RareDrop, HighlightEvent } from './types';

/**
 * Generate chronicle stats snapshot
 * Pulls data from missions, combat, market, social systems
 * Uses simple queries for performance
 */
export async function generateChronicleStats(
  input: ChronicleGenerationInput
): Promise<ChronicleStatsSnapshot> {
  const { startDate, endDate } = input;
  
  // Ensure dates are Date objects
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  try {
    // Fetch all data in parallel for performance
    const [xpLeaders, funniestAnswers, rareDrops, events, globalStats] = await Promise.all([
      getXPLeaders(start, end),
      getFunniestAnswers(start, end),
      getRareDrops(start, end),
      getHighlightEvents(start, end),
      getGlobalStats(start, end),
    ]);

    return {
      xpLeaders,
      funniestAnswers,
      rareDrops,
      events,
      globalStats,
    };
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to generate stats', { input, error });
    // Return empty snapshot on error
    return {
      xpLeaders: [],
      funniestAnswers: [],
      rareDrops: [],
      events: [],
    };
  }
}

/**
 * Get top XP leaders for the period
 */
async function getXPLeaders(start: Date, end: Date, limit: number = 10): Promise<XPLeader[]> {
  try {
    // Simple query: get users with highest XP gained in period
    // Note: This assumes XP is tracked incrementally - adjust based on your schema
    const users = await prisma.user.findMany({
      where: {
        // Filter by users active in the period (simplified)
        updatedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        xp: true,
        level: true,
      },
      orderBy: {
        xp: 'desc',
      },
      take: limit,
    });

    return users.map(user => ({
      userId: user.id,
      username: user.username,
      name: user.name,
      xp: user.xp || 0,
      level: user.level || 1,
    }));
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to get XP leaders', error);
    return [];
  }
}

/**
 * Get funniest answers (most upvoted or recent)
 */
async function getFunniestAnswers(start: Date, end: Date, limit: number = 5): Promise<FunniestAnswer[]> {
  try {
    // Query question answers with upvotes/reactions
    // Adjust based on your actual schema
    const answers = await prisma.questionAnswer.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        question: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }).catch(() => []);

    return answers.map(answer => ({
      userId: answer.userId,
      username: answer.user?.username,
      questionId: answer.questionId || undefined,
      answerText: answer.answer || '',
      upvotes: 0, // TODO: Add upvotes if available
      timestamp: answer.createdAt,
    }));
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to get funniest answers', error);
    return [];
  }
}

/**
 * Get rare drops (high rarity items)
 */
async function getRareDrops(start: Date, end: Date, limit: number = 10): Promise<RareDrop[]> {
  try {
    // Query user items with rare rarity
    const rareRarities = ['epic', 'legendary', 'mythic'];
    
    const items = await prisma.userItem.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        item: {
          rarity: {
            in: rareRarities,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
        item: {
          select: {
            id: true,
            name: true,
            rarity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    }).catch(() => []);

    return items.map(userItem => ({
      userId: userItem.userId,
      username: userItem.user?.username,
      itemId: userItem.itemId,
      itemName: userItem.item?.name || 'Unknown Item',
      rarity: userItem.item?.rarity || 'common',
      timestamp: userItem.createdAt,
    }));
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to get rare drops', error);
    return [];
  }
}

/**
 * Get highlight events (active events in period)
 */
async function getHighlightEvents(start: Date, end: Date): Promise<HighlightEvent[]> {
  try {
    const events = await prisma.event.findMany({
      where: {
        OR: [
          {
            startAt: {
              lte: end,
            },
            endAt: {
              gte: start,
            },
          },
        ],
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        startAt: true,
        endAt: true,
      },
      orderBy: {
        startAt: 'desc',
      },
      take: 5,
    }).catch(() => []);

    // Get participant counts (from EventLog if available)
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const count = await prisma.eventLog.count({
          where: {
            eventId: event.id,
            timestamp: {
              gte: start,
              lte: end,
            },
          },
        }).catch(() => 0);

        return {
          eventId: event.id,
          eventName: event.name,
          description: event.description,
          startAt: event.startAt,
          endAt: event.endAt,
          participantCount: count,
        };
      })
    );

    return eventsWithCounts;
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to get highlight events', error);
    return [];
  }
}

/**
 * Get global stats
 */
async function getGlobalStats(start: Date, end: Date): Promise<ChronicleStatsSnapshot['globalStats']> {
  try {
    const [totalXP, totalGold, missionsCompleted, fightsWon, activeUsers] = await Promise.all([
      // Sum XP gained (simplified - may need adjustment based on schema)
      prisma.user.aggregate({
        _sum: {
          xp: true,
        },
        where: {
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
      }).then(r => r._sum.xp || 0).catch(() => 0),
      
      // Sum gold (from funds or transactions)
      prisma.user.aggregate({
        _sum: {
          funds: true,
        },
        where: {
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
      }).then(r => Number(r._sum.funds) || 0).catch(() => 0),
      
      // Count completed missions
      prisma.missionProgress.count({
        where: {
          completed: true,
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
      }).catch(() => 0),
      
      // Count fight wins (adjust based on your combat schema)
      prisma.combatLog.count({
        where: {
          result: 'win',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      }).catch(() => 0),
      
      // Count active users
      prisma.user.count({
        where: {
          updatedAt: {
            gte: start,
            lte: end,
          },
        },
      }).catch(() => 0),
    ]);

    return {
      totalXP,
      totalGold,
      totalMissionsCompleted: missionsCompleted,
      totalFightsWon: fightsWon,
      activeUsers,
    };
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to get global stats', error);
    return undefined;
  }
}

/**
 * Generate and save chronicle entry
 */
export async function generateChronicle(
  input: ChronicleGenerationInput
): Promise<ChronicleGenerationResult> {
  try {
    // Generate stats snapshot
    const stats = await generateChronicleStats(input);

    // Generate AI story (stub)
    const aiStory = await generateChronicleStory(stats);

    // Check if chronicle already exists
    const existing = await prisma.chronicleEntry.findUnique({
      where: {
        seasonId_weekNumber: {
          seasonId: input.seasonId || null,
          weekNumber: input.weekNumber,
        },
      },
    });

    let chronicleId: string;

    if (existing) {
      // Update existing chronicle
      const updated = await prisma.chronicleEntry.update({
        where: { id: existing.id },
        data: {
          summaryJSON: stats as any,
          aiStory,
        },
      });
      chronicleId = updated.id;
    } else {
      // Create new chronicle
      const created = await prisma.chronicleEntry.create({
        data: {
          seasonId: input.seasonId || null,
          weekNumber: input.weekNumber,
          summaryJSON: stats as any,
          aiStory,
        },
      });
      chronicleId = created.id;
    }

    logger.info(`[ChronicleGenerator] Generated chronicle ${chronicleId} for week ${input.weekNumber}`);

    return {
      success: true,
      chronicleId,
      preview: stats,
    };
  } catch (error) {
    logger.error('[ChronicleGenerator] Failed to generate chronicle', { input, error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate chronicle',
    };
  }
}

/**
 * Generate AI story paragraph (stub)
 * TODO: Integrate with AI service
 */
async function generateChronicleStory(stats: ChronicleStatsSnapshot): Promise<string | null> {
  // Stub implementation - returns a simple template
  const leaderCount = stats.xpLeaders.length;
  const dropCount = stats.rareDrops.length;
  const eventCount = stats.events.length;
  
  if (leaderCount === 0 && dropCount === 0 && eventCount === 0) {
    return null;
  }

  // Simple template story
  const story = `This week saw ${leaderCount} top performers rise to the challenge, with ${dropCount} rare items discovered across the realm. ${eventCount > 0 ? `Special events brought the community together, with ${eventCount} highlight moments.` : ''} The world continues to evolve as adventurers push the boundaries of what's possible.`;

  return story;
}

