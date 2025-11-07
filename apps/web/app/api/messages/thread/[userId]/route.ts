import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError } from '@/lib/api-handler';

/**
 * GET /api/messages/thread/[userId]
 * Fetch full conversation with a specific user
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  const { userId: otherUserId } = params;

  // Check if other user exists
  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
  });

  if (!otherUser) {
    return notFoundError('User not found');
  }

  // Fetch messages between the two users (excluding hidden ones)
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        {
          senderId: user.userId,
          receiverId: otherUserId,
          hiddenBySender: false,
        },
        {
          senderId: otherUserId,
          receiverId: user.userId,
          hiddenByReceiver: false,
        },
      ],
    },
    orderBy: {
      createdAt: 'asc',
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      receiver: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    take: 100, // Limit to last 100 messages
  });

  // Mark messages as read (where current user is receiver)
  const unreadMessageIds = messages
    .filter((msg) => msg.receiverId === user.userId && !msg.isRead)
    .map((msg) => msg.id);

  if (unreadMessageIds.length > 0) {
    await prisma.message.updateMany({
      where: {
        id: { in: unreadMessageIds },
      },
      data: {
        isRead: true,
      },
    });
  }

  // Format messages
  const formattedMessages = messages.map((msg) => ({
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt,
    isRead: msg.isRead,
    isSentByMe: msg.senderId === user.userId,
    sender: msg.sender,
    receiver: msg.receiver,
    flagged: msg.flagged,
  }));

  return NextResponse.json({
    success: true,
    otherUser,
    messages: formattedMessages,
    count: messages.length,
  });
});

