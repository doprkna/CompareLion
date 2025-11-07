/**
 * Onboarding Submit API
 * v0.24.0 - Phase I: Smart Onboarding
 * 
 * POST /api/onboarding/submit
 * Saves user onboarding responses
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, successResponse } from '@/lib/api-handler';
import { validateOnboardingData, type OnboardingData } from '@/lib/types/onboarding';
import { z } from 'zod';

// Validation schema
const OnboardingSubmitSchema = z.object({
  ageGroup: z.string().optional(),
  region: z.string().optional(),
  interests: z.array(z.string()).optional(),
  tone: z.string().optional(),
});

/**
 * POST /api/onboarding/submit
 * Save onboarding data to user profile
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
    select: { id: true },
  });

  if (!user) {
    return authError('User not found');
  }

  // Parse and validate body
  let body: OnboardingData;
  try {
    body = await req.json();
    OnboardingSubmitSchema.parse(body);
  } catch (error) {
    return validationError('Invalid request body');
  }

  // Validate onboarding data
  const validation = validateOnboardingData(body);
  if (!validation.valid) {
    return validationError(validation.errors.join(', '));
  }

  // Update user profile
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      ageGroup: body.ageGroup,
      region: body.region,
      interests: body.interests || [],
      tone: body.tone,
      onboardingCompleted: true,
    },
    select: {
      id: true,
      ageGroup: true,
      region: true,
      interests: true,
      tone: true,
      onboardingCompleted: true,
    },
  });

  // Log activity
  try {
    await prisma.activity.create({
      data: {
        userId: user.id,
        action: 'onboarding_completed',
        metadata: {
          ageGroup: body.ageGroup,
          region: body.region,
          interests: body.interests,
          tone: body.tone,
        },
      },
    });
  } catch (error) {
    // Non-critical, continue
    console.warn('Failed to log onboarding activity:', error);
  }

  return successResponse({
    profile: updatedUser,
    message: 'Onboarding completed successfully! Welcome to the chaos 🎉',
  });
});

/**
 * GET /api/onboarding/submit
 * Get current onboarding status
 */
export const GET = safeAsync(async (req: NextRequest) => {
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
      ageGroup: true,
      region: true,
      interests: true,
      tone: true,
      onboardingCompleted: true,
    },
  });

  if (!user) {
    return authError('User not found');
  }

  return successResponse({
    profile: {
      ageGroup: user.ageGroup,
      region: user.region,
      interests: user.interests || [],
      tone: user.tone,
      onboardingCompleted: user.onboardingCompleted,
    },
  });
});

