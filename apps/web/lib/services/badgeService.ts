import { prisma } from '@/lib/db';

export async function grantBadge(userId: string, badgeSlug: string) {
  try {
    // Check if user already has this badge
    const existing = await prisma.userBadge.findFirst({
      where: {
        userId,
        badge: { slug: badgeSlug }
      }
    });

    if (existing) {
      return { granted: false, reason: 'already_earned' };
    }

    // Find the badge
    const badge = await prisma.badge.findUnique({
      where: { slug: badgeSlug }
    });

    if (!badge || !badge.active) {
      return { granted: false, reason: 'badge_not_found' };
    }

    // Grant the badge
    const userBadge = await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id
      }
    });

    return { granted: true, userBadge };
  } catch (error) {
    console.error('Error granting badge:', error);
    return { granted: false, reason: 'error' };
  }
}

export async function checkAndGrantPurchaseBadges(userId: string) {
  const results = [];

  // Check for First Purchase badge
  const firstPurchaseResult = await grantBadge(userId, 'first-purchase');
  if (firstPurchaseResult.granted) {
    results.push('first-purchase');
  }

  // Check for Big Spender badge (total spent >= 1000 funds)
  const totalSpent = await prisma.ledgerEntry.aggregate({
    where: {
      wallet: { userId },
      kind: 'DEBIT',
      currency: 'FUNDS'
    },
    _sum: { amount: true }
  });

  if (totalSpent._sum.amount && totalSpent._sum.amount >= 1000) {
    const bigSpenderResult = await grantBadge(userId, 'big-spender');
    if (bigSpenderResult.granted) {
      results.push('big-spender');
    }
  }

  return results;
}

export async function checkAndGrantSubscriptionBadge(userId: string) {
  // Check if user has an active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'active'
    }
  });

  if (subscription) {
    const result = await grantBadge(userId, 'subscriber');
    return result.granted ? ['subscriber'] : [];
  }

  return [];
}
