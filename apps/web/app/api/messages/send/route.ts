import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError, validationError } from '@/lib/api-handler';
import { moderateContent, shouldRateLimit } from '@/lib/moderation';
import { z } from 'zod';

/**
 * POST /api/messages/send
 * Send a direct message to another user
 */

const SendMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const user = await getUserFromRequest(req);
  if (!user) {
    return authError('Unauthorized');
  }

  // Check rate limiting
  const isRateLimited = await shouldRateLimit(user.userId, prisma);
  if (isRateLimited) {
    return validationError('You have been rate limited due to flagged content. Please try again later.');
  }

  const body = await req.json();
  const parsed = SendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid message data', parsed.error.issues);
  }

  const { receiverId, content } = parsed.data;

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true, visibility: true },
  });

  if (!receiver) {
    return notFoundError('User not found');
  }

  // Check if messaging is allowed based on visibility
  if (receiver.visibility === 'PRIVATE' && receiverId !== user.userId) {
    // Check if they're friends
    const areFriends = await prisma.friend.findFirst({
      where: {
        OR: [
          { userId: user.userId, friendId: receiverId, status: 'accepted' },
          { userId: receiverId, friendId: user.userId, status: 'accepted' },
        ],
      },
    });

    if (!areFriends) {
      return validationError('Cannot send message to this user');
    }
  }

  // Moderate content
  const moderation = moderateContent(content);

  // Create message
  const message = await prisma.message.create({
    data: {
      senderId: user.userId,
      receiverId,
      content,
      flagged: moderation.flagged,
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
    },
  });

  // Create notification for receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      senderId: user.userId,
      type: 'SYSTEM',
      title: 'New message',
      body: `${message.sender.username || message.sender.name || 'Someone'} sent you a message`,
    },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId: user.userId,
      type: 'message_sent',
      title: 'Sent a message',
      description: `Sent message to user`,
      metadata: { receiverId },
    },
  });

  return NextResponse.json({
    success: true,
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      sender: message.sender,
      flagged: message.flagged,
      moderationWarning: moderation.flagged ? moderation.reasons : undefined,
    },
  });
});

