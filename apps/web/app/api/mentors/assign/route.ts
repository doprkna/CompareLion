import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, archetypeKey: true } });
  if (!me) return unauthorizedError('Unauthorized');

  // Pick active mentor with matching affinity; fallback to any active
  let mentor = await prisma.mentorNPC.findFirst({ where: { isActive: true, archetypeAffinity: { has: me.archetypeKey || '' } } });
  if (!mentor) mentor = await prisma.mentorNPC.findFirst({ where: { isActive: true } });
  if (!mentor) return validationError('No mentors available');

  const rel = await prisma.userMentor.upsert({
    where: { userId_mentorId: { userId: me.id, mentorId: mentor.id } as any },
    update: { lastInteractionAt: new Date() },
    create: { userId: me.id, mentorId: mentor.id, affinityScore: 0.2 },
  } as any);

  return NextResponse.json({ success: true, mentor: { id: mentor.id, name: mentor.name, voiceTone: mentor.voiceTone, personality: mentor.personality }, affinity: rel.affinityScore });
});


