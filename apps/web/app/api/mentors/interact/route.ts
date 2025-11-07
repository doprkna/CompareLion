import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

const LINES: Record<string, Record<string, string>> = {
  calm: {
    default: 'Take a breath, {username}. Patterns emerge when you pause.',
  },
  chaotic: {
    default: "Oh, you're doing that again? Bold move.",
  },
  wise: {
    default: 'Progress hides in repetition, not novelty.',
  },
  sarcastic: {
    default: 'I’d clap, but you might stop reflecting.',
  },
};

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, name: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const { mentorId } = await req.json().catch(() => ({}));
  if (!mentorId) return validationError('Missing mentorId');

  const mentor = await prisma.mentorNPC.findUnique({ where: { id: mentorId } });
  if (!mentor) return validationError('Mentor not found');

  await prisma.userMentor.upsert({
    where: { userId_mentorId: { userId: me.id, mentorId: mentor.id } as any },
    update: { lastInteractionAt: new Date(), affinityScore: { increment: 0.01 } as any },
    create: { userId: me.id, mentorId: mentor.id, affinityScore: 0.21 },
  } as any);

  const tone = mentor.voiceTone || 'calm';
  const template = (LINES[tone]?.default || LINES.calm.default).slice(0, 200);
  const text = template.replace('{username}', me.name || 'friend');
  return NextResponse.json({ success: true, message: text });
});


