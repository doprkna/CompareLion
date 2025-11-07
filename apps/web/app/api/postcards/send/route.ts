import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const SendSchema = z.object({
  receiverId: z.string().min(1),
  message: z.string().min(1).max(300),
});

const MAX_PENDING_POSTCARDS = 10;

function simpleProfanityFilter(text: string): boolean {
  const blocked = ['spam', 'badword1', 'badword2']; // Placeholder
  const lower = text.toLowerCase();
  return !blocked.some((word) => lower.includes(word));
}

function randomDeliveryDelay(): Date {
  // Random delay between 1-3 hours
  const delayMs = Math.floor(Math.random() * (3 - 1 + 1) + 1) * 60 * 60 * 1000;
  return new Date(Date.now() + delayMs);
}

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = SendSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  if (parsed.data.receiverId === user.id) {
    return validationError('Cannot send postcard to yourself');
  }

  const receiver = await prisma.user.findUnique({
    where: { id: parsed.data.receiverId },
    select: { id: true },
  });
  if (!receiver) return notFoundError('Receiver not found');

  const message = parsed.data.message.trim();
  if (message.length < 1 || message.length > 300) {
    return validationError('Message must be 1-300 characters');
  }

  if (!simpleProfanityFilter(message)) {
    return validationError('Message contains inappropriate language');
  }

  // Check pending postcard limit
  const pendingCount = await prisma.postcard.count({
    where: {
      senderId: user.id,
      status: 'pending',
    },
  });

  if (pendingCount >= MAX_PENDING_POSTCARDS) {
    return validationError(`Maximum ${MAX_PENDING_POSTCARDS} pending postcards allowed`);
  }

  const deliveryAt = randomDeliveryDelay();

  const postcard = await prisma.postcard.create({
    data: {
      senderId: user.id,
      receiverId: parsed.data.receiverId,
      message,
      status: 'pending',
      deliveryAt,
    },
    include: {
      receiver: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      success: true,
      postcard: {
        id: postcard.id,
        message: postcard.message,
        status: postcard.status,
        deliveryAt: postcard.deliveryAt,
        receiver: postcard.receiver,
      },
    },
    { status: 201 }
  );
});

