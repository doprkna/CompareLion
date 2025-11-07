import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import prisma from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';

export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'CREATOR';

interface SubscriptionStatus {
  tier: SubscriptionTier;
  active: boolean;
  expiresAt?: Date;
  features: string[];
}

const TIER_FEATURES = {
  FREE: [
    'Basic reflections',
    'Public comparisons',
    'Standard messaging',
    'Community access',
  ],
  PREMIUM: [
    'All Free features',
    'VIP comparisons',
    'Advanced analytics',
    'Premium badge',
    'Ad-free experience',
    'Priority support',
  ],
  CREATOR: [
    'All Premium features',
    'Creator tools',
    'Revenue sharing',
    'Custom branding',
    'Analytics dashboard',
    'Early access features',
  ],
};

/**
 * GET /api/subscription/status
 * Get user's subscription status
 */
export const GET = safeAsync(async (_request: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: {
          status: 'active',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return notFoundError('User');
  }

    // Determine tier
    let tier: SubscriptionTier = 'FREE';
    let active = false;
    let expiresAt: Date | undefined;

    if (user.subscriptions.length > 0) {
      const subscription = user.subscriptions[0];
      
      // Check if still active
      if (subscription.currentPeriodEnd > new Date()) {
        active = true;
        expiresAt = subscription.currentPeriodEnd;
        
        // Map plan to tier
        if (subscription.plan.includes('creator')) {
          tier = 'CREATOR';
        } else if (subscription.plan.includes('premium')) {
          tier = 'PREMIUM';
        }
      }
    }

  const status: SubscriptionStatus = {
    tier,
    active,
    expiresAt,
    features: TIER_FEATURES[tier],
  };

  return NextResponse.json(status);
});

