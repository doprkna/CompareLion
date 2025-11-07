import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { z } from 'zod';

const Schema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  xpBonus: z.number().max(2).optional(),
  goldBonus: z.number().max(2).optional(),
  eventModifier: z.any().optional(),
  npcIds: z.array(z.string()).optional(),
  themeColor: z.string().optional(),
  posterUrl: z.string().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  const auth = await requireAdmin(req);
  if (!token && (!auth.success || !auth.user)) return unauthorizedError('Admin or token required');
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');
  
  // Close any existing active season
  await prisma.seasonStoryline.updateMany({ where: { isActive: true }, data: { isActive: false } });
  
  const season = await prisma.seasonStoryline.create({
    data: {
      key: parsed.data.key,
      title: parsed.data.title,
      description: parsed.data.description,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      isActive: true,
      xpBonus: parsed.data.xpBonus || null,
      goldBonus: parsed.data.goldBonus || null,
      eventModifier: parsed.data.eventModifier || null,
      npcIds: parsed.data.npcIds || [],
      themeColor: parsed.data.themeColor || null,
      posterUrl: parsed.data.posterUrl || null,
    },
  });
  return NextResponse.json({ success: true, season }, { status: 201 });
});






