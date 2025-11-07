import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const arch = req.nextUrl.searchParams.get('arch');
  const mentors = await prisma.mentorNPC.findMany({
    where: arch ? { isActive: true, archetypeAffinity: { has: arch } } : { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, key: true, name: true, personality: true, voiceTone: true, introText: true, tips: true, archetypeAffinity: true },
  });
  return NextResponse.json({ success: true, mentors });
});


