/**
 * Challenges API
 * Returns daily and weekly challenges
 * v0.13.2n - Community Growth
 * v0.41.6 - C3 Step 7: Unified API envelope
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */

import { NextRequest } from 'next/server';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess } from '@parel/api';
import type { ChallengeDTO, ChallengesResponseDTO } from '@parel/types/dto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Preset challenges pool
const DAILY_CHALLENGES = [
  {
    id: 'daily_questions_5',
    title: 'Question Marathon',
    description: 'Answer 5 questions today',
    type: 'daily',
    target: 5,
    metric: 'questions_answered',
    reward: { xp: 50, diamonds: 10 },
    icon: 'dYZ_',
  },
  {
    id: 'daily_streak_maintain',
    title: 'Keep The Flame',
    description: 'Maintain your streak today',
    type: 'daily',
    target: 1,
    metric: 'streak_maintained',
    reward: { xp: 30, diamonds: 5 },
    icon: 'dY"�',
  },
  {
    id: 'daily_perfect_5',
    title: 'Perfectionist',
    description: 'Answer 5 questions without skipping',
    type: 'daily',
    target: 5,
    metric: 'perfect_answers',
    reward: { xp: 75, diamonds: 15 },
    icon: '�-?',
  },
  {
    id: 'daily_speed_demon',
    title: 'Speed Demon',
    description: 'Answer 10 questions in under 5 minutes',
    type: 'daily',
    target: 10,
    metric: 'fast_answers',
    reward: { xp: 100, diamonds: 20 },
    icon: '�s�',
  },
  {
    id: 'daily_social_butterfly',
    title: 'Social Butterfly',
    description: 'Send 3 messages to friends',
    type: 'daily',
    target: 3,
    metric: 'messages_sent',
    reward: { xp: 40, diamonds: 8 },
    icon: 'dY',
  },
];

const WEEKLY_CHALLENGES = [
  {
    id: 'weekly_questions_25',
    title: 'Weekly Warrior',
    description: 'Answer 25 questions this week',
    type: 'weekly',
    target: 25,
    metric: 'questions_answered',
    reward: { xp: 200, diamonds: 50 },
    icon: 'dY?+',
  },
  {
    id: 'weekly_streak_7',
    title: 'Week Streak',
    description: 'Maintain a 7-day streak',
    type: 'weekly',
    target: 7,
    metric: 'streak_days',
    reward: { xp: 300, diamonds: 75 },
    icon: 'dY"�',
  },
  {
    id: 'weekly_refer_friend',
    title: 'Invite a Friend',
    description: 'Get 1 friend to join via your invite code',
    type: 'weekly',
    target: 1,
    metric: 'referrals',
    reward: { xp: 150, diamonds: 100 },
    icon: 'dY�',
  },
  {
    id: 'weekly_share_3',
    title: 'Social Sharer',
    description: 'Share your progress 3 times',
    type: 'weekly',
    target: 3,
    metric: 'shares',
    reward: { xp: 100, diamonds: 30 },
    icon: 'dY"�',
  },
];

// Deterministic random selection based on date
function getDailyChallenges(date: Date): any[] {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // Pick 3 challenges based on day
  const seed = dayOfYear;
  const indices = [
    seed % DAILY_CHALLENGES.length,
    (seed + 1) % DAILY_CHALLENGES.length,
    (seed + 2) % DAILY_CHALLENGES.length,
  ];
  
  return indices.map(i => DAILY_CHALLENGES[i]);
}

function getWeeklyChallenges(date: Date): any[] {
  const weekOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 604800000
  );
  
  // Pick 2 weekly challenges
  const seed = weekOfYear;
  const indices = [
    seed % WEEKLY_CHALLENGES.length,
    (seed + 1) % WEEKLY_CHALLENGES.length,
  ];
  
  return indices.map(i => WEEKLY_CHALLENGES[i]);
}

/**
 * GET /api/challenges
 * Returns active daily and weekly challenges
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const now = new Date();

  const dailyChallenges = getDailyChallenges(now);
  const weeklyChallenges = getWeeklyChallenges(now);

  // In production, you'd fetch progress from database
  // For now, return challenges with 0 progress (client will use localStorage)
  const formattedDaily: ChallengeDTO[] = dailyChallenges.map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
  }));

  const formattedWeekly: ChallengeDTO[] = weeklyChallenges.map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
  }));

  const response: ChallengesResponseDTO = {
    daily: formattedDaily,
    weekly: formattedWeekly,
    timestamp: now.toISOString(),
  };

  return buildSuccess(req, response);
});

/**
 * POST /api/challenges
 * Update challenge progress (stored in localStorage on client)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return buildSuccess(req, { message: 'Guest mode - progress saved locally' });
  }

  // In future, save to database
  // For now, just acknowledge
  return buildSuccess(req, { message: 'Progress updated' });
});

