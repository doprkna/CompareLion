import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { toUserDTO, UserDTO } from '@/lib/dto/userDTO';
import bcrypt from 'bcrypt';
import { getUserProfile, updateUserProfile } from '@/lib/services/userService';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError, validationError } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import type { UserProfileWithStatsDTO, ProfileResponseDTO, SessionDTO, UserStatsDTO, TodayActivityDTO } from '@parel/types/dto';
import { z } from 'zod';

function _msToHMS(ms: number) {
  if (!ms || ms < 0) return '0s';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [
    h ? h + 'h' : '',
    m ? m + 'm' : '',
    sec ? sec + 's' : '',
  ].filter(Boolean).join(' ');
}

/**
 * GET /api/profile
 * Get user profile with stats and progression
 * v0.41.3 - C3 Step 4: Unified API envelope
 * v0.41.10 - C3 Step 11: DTO Consolidation Batch #3
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'Unauthorized');
  }
  const dbUser = await getUserProfile(user.userId);
  if (!dbUser) {
    return buildError(req, ApiErrorCode.NOT_FOUND, 'User not found');
  }
  // Stats: per session
  const sessions = await prisma.flowProgress.findMany({ where: { userId: dbUser.id }, orderBy: { startedAt: 'desc' } });
  let totalAnswers = 0;
  let totalTime = 0;
  const sessionStats: SessionDTO[] = await Promise.all(sessions.map(async (session: any) => {
    const count = await prisma.answer.count({ where: { sessionId: session.id } });
    totalAnswers += count;
    const start = session.startedAt ? new Date(session.startedAt).getTime() : 0;
    const end = session.completedAt ? new Date(session.completedAt).getTime() : (session.updatedAt ? new Date(session.updatedAt).getTime() : start);
    const timeSpent = end - start;
    totalTime += timeSpent > 0 ? timeSpent : 0;
    return {
      id: session.id,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      answers: count,
      timeSpent,
    };
  }));
  const lastSession = sessionStats[0] || { answers: 0, timeSpent: 0 };
  // Build base DTO and then attach stats
  const baseUser: UserDTO = toUserDTO(dbUser);
  // Compute today's answered/skipped
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [answeredToday, skippedToday] = await Promise.all([
    prisma.userQuestion.count({ where: { userId: dbUser.id, status: 'answered', updatedAt: { gte: todayStart } } }),
    prisma.userQuestion.count({ where: { userId: dbUser.id, status: 'skipped', updatedAt: { gte: todayStart } } }),
  ]);
  
  const stats: UserStatsDTO = {
    totalSessions: sessions.length,
    totalAnswers,
    totalTime,
    lastSessionAnswers: lastSession.answers,
    lastSessionTime: lastSession.timeSpent,
  };
  
  const today: TodayActivityDTO = {
    answered: answeredToday,
    skipped: skippedToday,
  };
  
  const userProfile: UserProfileWithStatsDTO = {
    ...baseUser,
    streakCount: dbUser.streakCount,
    today,
    stats,
    sessions: sessionStats.map((s: SessionDTO) => ({
      id: s.id,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
      answers: s.answers,
      timeSpent: s.timeSpent,
    })),
  };
  
  const response: ProfileResponseDTO = {
    user: userProfile,
  };
  
  return buildSuccess(req, response);
});
