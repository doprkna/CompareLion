import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, notFoundError, successResponse } from '@/lib/api-handler';

/**
 * GET /api/share/[id]
 * Returns public share card with signed token (valid 48h)
 * Public endpoint (no auth required)
 * v0.29.15 - Share Cards
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  // Get share card
  const shareCard = await prisma.shareCard.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          // Only include public data
        },
      },
    },
  });

  if (!shareCard) {
    return notFoundError('Share card not found');
  }

  // Check if expired
  const now = new Date();
  if (shareCard.expiresAt < now) {
    return notFoundError('Share card has expired');
  }

  // Return public share card (no personal data)
  return successResponse({
    shareCard: {
      id: shareCard.id,
      type: shareCard.type,
      imageUrl: shareCard.imageUrl,
      caption: shareCard.caption,
      createdAt: shareCard.createdAt,
      expiresAt: shareCard.expiresAt,
      user: {
        // Only public data
        username: shareCard.user.username || shareCard.user.name || 'Anonymous',
        avatarUrl: shareCard.user.avatarUrl,
      },
    },
  });
});

