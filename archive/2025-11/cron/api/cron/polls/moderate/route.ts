import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

const FLAGGED = ['spam', 'scam', 'hate', 'abuse'];

export const POST = safeAsync(async (req: NextRequest) => {
  // Simple shared secret header to gate cron
  const token = req.headers.get('x-cron-token');
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError('Invalid token');
  }

  // Scan last 500 freetext responses for flagged words
  const recent = await prisma.pollResponse.findMany({
    where: { freetext: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: { id: true, freetext: true, pollId: true, userId: true },
  });

  const flagged = recent.filter(r => {
    const text = (r.freetext || '').toLowerCase();
    return FLAGGED.some(w => text.includes(w));
  });

  for (const f of flagged) {
    await prisma.actionLog.create({ data: { userId: f.userId, action: 'poll_freetext_flag', metadata: { pollId: f.pollId, responseId: f.id } as any } });
  }

  return NextResponse.json({ success: true, scanned: recent.length, flagged: flagged.length });
});


