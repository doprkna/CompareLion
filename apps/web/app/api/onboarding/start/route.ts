/**
 * Onboarding Start API
 * v0.24.0 - Phase I: Smart Onboarding
 * 
 * POST /api/onboarding/start
 * Creates or resets onboarding session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, successResponse } from '@/lib/api-handler';
import { detectRegionFromBrowser } from '@parel/types/onboarding';

/**
 * POST /api/onboarding/start
 * Initialize onboarding session with auto-detected defaults
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      onboardingCompleted: true,
      region: true,
      ageGroup: true,
      interests: true,
      tone: true,
    },
  });

  if (!user) {
    return authError('User not found');
  }

  // Auto-detect region from headers if not set
  const acceptLanguage = req.headers.get('accept-language');
  let suggestedRegion = user.region;
  
  if (!suggestedRegion) {
    // Try to detect from browser
    try {
      suggestedRegion = detectRegionFromBrowser();
    } catch {
      suggestedRegion = 'GLOBAL';
    }
  }

  // Return current state + suggestions
  return successResponse({
    userId: user.id,
    currentState: {
      ageGroup: user.ageGroup,
      region: user.region,
      interests: user.interests || [],
      tone: user.tone,
      onboardingCompleted: user.onboardingCompleted,
    },
    suggestions: {
      region: suggestedRegion,
    },
    sessionCreated: new Date().toISOString(),
  });
});

