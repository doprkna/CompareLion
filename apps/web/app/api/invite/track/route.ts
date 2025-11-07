/**
 * Track successful signup via referral code
 * Awards XP + badge to both referrer and referee
 * v0.15.0 - Marketing Expansion
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, notFoundError } from '@/lib/api-handler';

const REFERRAL_BONUS_XP = 100;
const SIGNUP_BONUS_XP = 50;
const REFERRAL_BADGE_TYPE = 'referral_master';

export const POST = safeAsync(async (request: NextRequest) => {
  const body = await request.json();
  const { newUserId, referralCode } = body;

  if (!newUserId || !referralCode) {
    return validationError('Missing required fields');
  }

  // Find the referrer by invite code
  const referrer = await prisma.user.findFirst({
    where: { inviteCode: referralCode }
  });

  if (!referrer) {
    return notFoundError('Invalid referral code');
  }

  // Check if this referral was already tracked
  const existingReferral = await prisma.referral.findFirst({
    where: {
      referrerId: referrer.id,
      referredUserId: newUserId
    }
  });

  if (existingReferral) {
    return NextResponse.json(
      { success: true, message: 'Referral already tracked', timestamp: new Date().toISOString() }
    );
  }

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        referredUserId: newUserId,
        status: 'completed',
        rewardGranted: true
      }
    });

    // Award XP to referrer
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        xp: { increment: REFERRAL_BONUS_XP }
      }
    });

    // Award XP to new user
    await prisma.user.update({
      where: { id: newUserId },
      data: {
        xp: { increment: SIGNUP_BONUS_XP }
      }
    });

    // Check if referrer should get badge (5+ referrals)
    const referralCount = await prisma.referral.count({
      where: {
        referrerId: referrer.id,
        status: 'completed'
      }
    });

    if (referralCount >= 5 && referrer.badgeType !== REFERRAL_BADGE_TYPE) {
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          badgeType: REFERRAL_BADGE_TYPE
        }
      });
    }

    // Log event
    await prisma.eventLog.create({
      data: {
        userId: referrer.id,
        eventType: 'REFERRAL_COMPLETED',
        title: 'Referral Success!',
        description: `You earned ${REFERRAL_BONUS_XP} XP for referring a friend`,
        eventData: {
          referredUserId: newUserId,
          xpAwarded: REFERRAL_BONUS_XP,
          totalReferrals: referralCount
        }
      }
    });

  // Track metrics (fire and forget)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      events: [{
        name: 'referral_success',
        timestamp: Date.now(),
        data: { referrerId: referrer.id, newUserId }
      }]
    })
  }).catch(() => {
    // Silently fail - metrics not critical
  });

  return NextResponse.json({
    success: true,
    referralBonus: REFERRAL_BONUS_XP,
    signupBonus: SIGNUP_BONUS_XP,
    totalReferrals: referralCount,
    timestamp: new Date().toISOString(),
  });
});

