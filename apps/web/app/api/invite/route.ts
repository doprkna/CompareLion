/**
 * Invite/Referral API
 * Generates and tracks invite codes
 * v0.13.2n - Community Growth
 */

import { NextRequest } from 'next/server';
import { safeAsync, successResponse, errorResponse } from '@/lib/api-handler';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

// Generate a unique 6-character code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing chars
  let code = 'INV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * GET /api/invite
 * Get user's invite code and referral stats
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return errorResponse('Unauthorized', 401);
  }

  const userId = session.user.id;

  // Get or create invite code from localStorage-style approach
  // In production, store in user profile or separate table
  
  // For now, generate deterministic code based on user ID
  const inviteCode = `INV-${userId.slice(0, 6).toUpperCase()}`;

  // Get referral stats from localStorage (client-side tracking)
  // In production, query database for referrals
  
  return successResponse({
    inviteCode,
    referralCount: 0, // Client will update from localStorage
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/?ref=${inviteCode}`,
  });
});

/**
 * POST /api/invite
 * Track a referral (called when new user signs up with code)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { referralCode } = body;

  if (!referralCode) {
    return errorResponse('Referral code required', 400);
  }

  // In production, you would:
  // 1. Validate referral code
  // 2. Link new user to referrer
  // 3. Award rewards to both parties
  // 4. Update referral counts

  // For now, track in metrics
  fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      events: [{
        name: 'invite_generated',
        timestamp: Date.now(),
        data: { referralCode },
      }],
    }),
  }).catch(() => {});

  return successResponse({
    message: 'Referral tracked',
    code: referralCode,
  });
});
