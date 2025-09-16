import { NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { getUserFromRequest } from '../_utils';
import bcrypt from 'bcrypt';
import type { FlowProgress } from '@prisma/client';

function msToHMS(ms: number) {
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

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
  if (!dbUser) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }
  // Stats: per session
  const sessions = await prisma.flowProgress.findMany({ where: { userId: dbUser.id }, orderBy: { startedAt: 'desc' } });
  let totalAnswers = 0;
  let totalTime = 0;
  const sessionStats = await Promise.all(sessions.map(async (session: FlowProgress) => {
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
  // Return all profile fields and stats
  const { id, email, name, phone, language, country, dateOfBirth, avatarUrl, motto, createdAt, lastLoginAt, lastActiveAt, theme, funds, diamonds, xp, level } = dbUser;
  return NextResponse.json({
    success: true,
    user: {
      id, email, name, phone, language, country, dateOfBirth, avatarUrl, motto, createdAt, lastLoginAt, lastActiveAt, theme, funds: funds?.toString() || '0', diamonds, xp, level,
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
}

export async function PATCH(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const data: any = {};
  if (body.email) data.email = body.email;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);
  if (body.name) data.name = body.name;
  if (body.phone) data.phone = body.phone;
  if (body.language) data.language = body.language;
  if (body.country) data.country = body.country;
  if (body.dateOfBirth) data.dateOfBirth = new Date(body.dateOfBirth);
  if (body.avatarUrl) data.avatarUrl = body.avatarUrl;
  if (body.motto) data.motto = body.motto;
  if (body.theme) data.theme = body.theme;
  if (body.funds !== undefined) data.funds = body.funds;
  if (body.diamonds !== undefined) data.diamonds = body.diamonds;
  if (body.xp !== undefined) data.xp = body.xp;
  if (body.level !== undefined) data.level = body.level;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: false, message: 'No changes provided' }, { status: 400 });
  }
  await prisma.user.update({ where: { id: user.userId }, data });
  return NextResponse.json({ success: true, message: 'Profile updated' });
}
