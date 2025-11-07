import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const SubmitSchema = z.object({
  title: z.string().min(3).max(200),
  type: z.enum(['question', 'mission', 'item', 'other']),
  content: z.any(), // JSON or text
  rewardXP: z.number().int().min(0).max(1000).optional(),
  rewardKarma: z.number().int().min(0).max(500).optional(),
});

function simpleProfanityFilter(text: string): boolean {
  // Simple placeholder - replace with actual filter
  const blocked = ['spam', 'badword1', 'badword2']; // Placeholder
  const lower = text.toLowerCase();
  return !blocked.some((word) => lower.includes(word));
}

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const title = parsed.data.title.trim();
  const contentStr = typeof parsed.data.content === 'string' 
    ? parsed.data.content 
    : JSON.stringify(parsed.data.content);

  // Simple validation
  if (title.length < 3 || title.length > 200) {
    return validationError('Title must be 3-200 characters');
  }

  if (contentStr.length < 10 || contentStr.length > 5000) {
    return validationError('Content must be 10-5000 characters');
  }

  // Simple profanity filter
  if (!simpleProfanityFilter(title) || !simpleProfanityFilter(contentStr)) {
    return validationError('Content contains inappropriate language');
  }

  const creation = await prisma.communityCreation.create({
    data: {
      userId: user.id,
      title,
      type: parsed.data.type,
      content: parsed.data.content,
      status: 'pending',
      likes: 0,
      rewardXP: parsed.data.rewardXP || null,
      rewardKarma: parsed.data.rewardKarma || null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ success: true, creation }, { status: 201 });
});

