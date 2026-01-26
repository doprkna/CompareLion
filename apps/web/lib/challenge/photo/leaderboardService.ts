/**
 * Photo Challenge Leaderboard Service
 * Weekly ranking of photo challenge entries
 * v0.37.14 - Snack Leaderboard
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getChallengeEntryScore } from './aureIntegration';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  imageUrl: string;
  category: string;
  createdAt: Date;
  totalScore: number;
  appealScore: number;
  creativityScore: number;
  finalScore: number;
  humanScore: number;
  aiScore: number;
  hasAiRating: boolean;
  rank: number;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface UserRank {
  rank: number;
  total: number;
  entryId: string;
}

/**
 * Get start of current week (Monday 00:00 UTC)
 */
function getWeekStartUTC(): Date {
  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  
  // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const dayOfWeek = utcNow.getUTCDay();
  
  // Calculate days until Monday (Monday = 0)
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 1 - dayOfWeek;
  
  const weekStart = new Date(utcNow);
  weekStart.setUTCDate(utcNow.getUTCDate() + daysUntilMonday);
  weekStart.setUTCHours(0, 0, 0, 0);
  
  return weekStart;
}

/**
 * Get weekly leaderboard for photo challenge entries
 * 
 * @param category - Optional category filter
 * @param limit - Maximum number of entries to return (default: 20)
 * @returns Top entries sorted by total score (appeal + creativity)
 */
export async function getWeeklyLeaderboard(
  category?: string,
  limit: number = 20
): Promise<LeaderboardEntry[]> {
  try {
    const weekStart = getWeekStartUTC();
    
    // Fetch entries from this week
    const entries = await prisma.photoChallengeEntry.findMany({
      where: {
        createdAt: {
          gte: weekStart,
        },
        ...(category ? { category } : {}),
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

    // Aggregate scores for each entry (including AI scores)
    const entriesWithScores = await Promise.all(
      entries.map(async (entry) => {
        const [appealCount, creativityCount, entryScore] = await Promise.all([
          prisma.photoVote.count({
            where: {
              entryId: entry.id,
              voteType: 'appeal',
            },
          }),
          prisma.photoVote.count({
            where: {
              entryId: entry.id,
              voteType: 'creativity',
            },
          }),
          getChallengeEntryScore(entry.id),
        ]);

        const totalScore = appealCount + creativityCount;

        return {
          id: entry.id,
          userId: entry.userId,
          imageUrl: entry.imageUrl,
          category: entry.category,
          createdAt: entry.createdAt,
          totalScore,
          appealScore: appealCount,
          creativityScore: creativityCount,
          finalScore: entryScore.finalScore,
          humanScore: entryScore.humanScore,
          aiScore: entryScore.aiScore,
          hasAiRating: entryScore.hasAiRating,
          user: entry.user ? {
            id: entry.user.id,
            name: entry.user.name,
            image: entry.user.image,
          } : undefined,
        };
      })
    );

    // Sort by final score (descending), then by createdAt (ascending for tie-breaking)
    entriesWithScores.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Add rank numbers and limit results
    const rankedEntries: LeaderboardEntry[] = entriesWithScores
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return rankedEntries;
  } catch (error) {
    logger.error('[LeaderboardService] Failed to get weekly leaderboard', {
      category,
      error,
    });
    return [];
  }
}

/**
 * Get user's rank in the weekly leaderboard
 * 
 * @param userId - User ID
 * @param category - Optional category filter
 * @returns User's rank and total score, or null if no entry
 */
export async function getUserRank(
  userId: string,
  category?: string
): Promise<UserRank | null> {
  try {
    const weekStart = getWeekStartUTC();
    
    // Find user's entry from this week
    const userEntry = await prisma.photoChallengeEntry.findFirst({
      where: {
        userId,
        createdAt: {
          gte: weekStart,
        },
        ...(category ? { category } : {}),
      },
      orderBy: {
        createdAt: 'desc', // Get most recent entry
      },
    });

    if (!userEntry) {
      return null;
    }

    // Get all entries from this week
    const allEntries = await prisma.photoChallengeEntry.findMany({
      where: {
        createdAt: {
          gte: weekStart,
        },
        ...(category ? { category } : {}),
      },
    });

    // Calculate scores for all entries (including AI scores)
    const entriesWithScores = await Promise.all(
      allEntries.map(async (entry) => {
        const entryScore = await getChallengeEntryScore(entry.id);
        return {
          id: entry.id,
          totalScore: entryScore.humanScore,
          finalScore: entryScore.finalScore,
          createdAt: entry.createdAt,
        };
      })
    );

    // Sort by final score (descending), then by createdAt (ascending)
    entriesWithScores.sort((a, b) => {
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    // Find user's rank
    const userIndex = entriesWithScores.findIndex((e) => e.id === userEntry.id);
    
    if (userIndex === -1) {
      return null;
    }

    // Calculate user's final score
    const userScore = await getChallengeEntryScore(userEntry.id);

    return {
      rank: userIndex + 1,
      total: Math.round(userScore.finalScore),
      entryId: userEntry.id,
    };
  } catch (error) {
    logger.error('[LeaderboardService] Failed to get user rank', {
      userId,
      category,
      error,
    });
    return null;
  }
}

