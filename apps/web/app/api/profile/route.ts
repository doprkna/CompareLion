import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { toUserDTO, UserDTO } from '@/lib/dto/userDTO';
import bcrypt from 'bcrypt';
import { getUserProfile, updateUserProfile } from '@/lib/services/userService';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError, validationError } from '@/lib/api-handler';
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

export const GET = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }
  const dbUser = await getUserProfile(user.userId);
  if (!dbUser) {
    return notFoundError('User');
  }
  // Stats: per session
  const sessions = await prisma.flowProgress.findMany({ where: { userId: dbUser.id }, orderBy: { startedAt: 'desc' } });
  let totalAnswers = 0;
  let totalTime = 0;
  const sessionStats = await Promise.all(sessions.map(async (session: any) => {
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
  return NextResponse.json({
    success: true,
    user: {
      ...baseUser,
      streakCount: dbUser.streakCount,
      today: { answered: answeredToday, skipped: skippedToday },
      stats: {
        totalSessions: sessions.length,
        totalAnswers,
        totalTime,
        lastSessionAnswers: lastSession.answers,
        lastSessionTime: lastSession.timeSpent,
      },
      sessions: sessionStats.map((s: { id: string; startedAt: Date; completedAt: Date | null; answers: number; timeSpent: number }) => ({
        id: s.id,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        answers: s.answers,
        timeSpent: s.timeSpent,
      })),
    },
  });
});

const ProfileUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  motto: z.string().optional(),
  theme: z.string().optional(),
  funds: z.number().optional(),
  diamonds: z.number().optional(),
  xp: z.number().optional(),
  level: z.number().optional(),
});

export const PATCH = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }
  
  const body = await req.json();
  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid profile data', parsed.error.issues);
  }
  
  const validData = parsed.data;
  const data: any = {};
  if (validData.email) data.email = validData.email;
  if (validData.password) data.password = await bcrypt.hash(validData.password, 10);
  if (validData.name) data.name = validData.name;
  if (validData.phone) data.phone = validData.phone;
  if (validData.language) data.language = validData.language;
  if (validData.country) data.country = validData.country;
  if (validData.dateOfBirth) data.dateOfBirth = new Date(validData.dateOfBirth);
  if (validData.avatarUrl) data.avatarUrl = validData.avatarUrl;
  if (validData.motto) data.motto = validData.motto;
  if (validData.theme) data.theme = validData.theme;
  if (validData.funds !== undefined) data.funds = validData.funds;
  if (validData.diamonds !== undefined) data.diamonds = validData.diamonds;
  if (validData.xp !== undefined) data.xp = validData.xp;
  if (validData.level !== undefined) data.level = validData.level;
  
  if (Object.keys(data).length === 0) {
    return validationError('No changes provided');
  }
  
  await updateUserProfile(user.userId, data);
  return NextResponse.json({ success: true, message: 'Profile updated' });
});
