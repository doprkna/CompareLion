import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError } from '@/lib/api-handler';
import { getAdminStatus } from '@/lib/adminAuth';

/**
 * GET /api/moderation/flagged
 * List all flagged content (admin only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Check admin status
  const isAdminUser = await getAdminStatus(user.userId, user.email);
  if (!isAdminUser) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // 'message', 'comment', 'reflection', or null for all

  // Fetch flagged messages
  let messages: any[] = [];
  if (!type || type === 'message') {
    messages = await prisma.message.findMany({
      where: { flagged: true, hiddenBySender: false, hiddenByReceiver: false },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Fetch flagged comments
  let comments: any[] = [];
  if (!type || type === 'comment') {
    comments = await prisma.comment.findMany({
      where: { flagged: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Fetch flagged reflections
  let reflections: any[] = [];
  if (!type || type === 'reflection') {
    // Assuming reflections can be flagged (you may need to add flagged field to ReflectionEntry)
    reflections = await prisma.reflectionEntry.findMany({
      where: { isPrivate: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        userId: true,
        title: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  // Format results
  const formattedMessages = messages.map((msg) => ({
    type: 'message',
    id: msg.id,
    content: msg.content,
    author: msg.sender.username || msg.sender.name || msg.sender.email,
    authorId: msg.sender.id,
    createdAt: msg.createdAt,
    flagCount: 1, // Simplified for now
  }));

  const formattedComments = comments.map((cmt) => ({
    type: 'comment',
    id: cmt.id,
    content: cmt.content,
    author: cmt.user.username || cmt.user.name || cmt.user.email,
    authorId: cmt.user.id,
    createdAt: cmt.createdAt,
    flagCount: 1, // Simplified for now
  }));

  const formattedReflections = reflections.map((ref) => ({
    type: 'reflection',
    id: ref.id,
    content: ref.content,
    author: ref.user.username || ref.user.name || ref.user.email,
    authorId: ref.userId,
    createdAt: ref.createdAt,
    flagCount: 0, // Not currently flagged
  }));

  const allFlagged = [
    ...formattedMessages,
    ...formattedComments,
    ...formattedReflections,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    success: true,
    flagged: allFlagged,
    count: allFlagged.length,
  });
});

