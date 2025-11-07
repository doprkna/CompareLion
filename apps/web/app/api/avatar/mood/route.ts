import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, avatarTheme: true } });
  if (!me) return unauthorizedError('Unauthorized');
  const mood = await prisma.avatarMood.findFirst({ where: { userId: me.id }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ success: true, mood, avatarTheme: me.avatarTheme || null });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const { mood, pose } = await req.json().catch(() => ({}));
  const allowedMood = ['neutral','happy','sad','angry','excited','tired','focused'];
  const allowedPose = ['default','thinking','celebrating','resting'];
  if (!allowedMood.includes(mood) || !allowedPose.includes(pose)) return validationError('Invalid mood/pose');

  const last = await prisma.avatarMood.findFirst({ where: { userId: me.id }, orderBy: { updatedAt: 'desc' } });
  if (last && Date.now() - new Date(last.updatedAt).getTime() < 30 * 1000) return validationError('Rate limited');

  const entry = await prisma.avatarMood.create({ data: { userId: me.id, mood, pose, emotionScore: 0, source: 'manual' } });
  return NextResponse.json({ success: true, mood: entry });
});


