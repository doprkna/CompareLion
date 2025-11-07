/**
 * Referrals API
 * Get user's referral stats and history
 * v0.15.0 - Marketing Expansion
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError, notFoundError } from '@/lib/api-handler';

const REFERRAL_BONUS_XP = 100;

export const GET = safeAsync(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      inviteCode: true
    }
  });

  if (!user) {
    return notFoundError('User');
  }

    // Get or generate invite code
    let inviteCode = user.inviteCode;
    if (!inviteCode) {
      // Generate invite code
      inviteCode = `INV-${user.id.slice(0, 6).toUpperCase()}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { inviteCode }
      });
    }

    // Get referral stats
    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: user.id,
        status: 'completed'
      },
      include: {
        referredUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const referralCount = referrals.length;
    const totalXpEarned = referralCount * REFERRAL_BONUS_XP;

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/signup?ref=${inviteCode}`;

  return successResponse({
    inviteCode,
    shareUrl,
    referralCount,
    totalXpEarned,
    referrals
  });
});
