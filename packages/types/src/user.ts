/**
 * User Type Definitions
 * v0.24.0 - Phase I: Extended with onboarding profile
 */

import type { User as PrismaUser } from '@parel/db/client';
import type { OnboardingProfile, AgeGroupId, RegionId, InterestId, ToneId } from './onboarding';

/**
 * Extended User Profile with onboarding data
 */
export interface UserProfile {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  
  // Onboarding fields (Phase I)
  ageGroup?: AgeGroupId | null;
  region?: RegionId | null;
  interests?: InterestId[];
  tone?: ToneId | null;
  onboardingCompleted?: boolean;
  
  // Stats
  xp?: number;
  level?: number;
  streakCount?: number;
  questionsAnswered?: number;
  
  // Metadata
  createdAt?: Date;
  lastLoginAt?: Date | null;
}

/**
 * Convert Prisma User to UserProfile
 */
export function toUserProfile(user: PrismaUser): UserProfile {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    
    // Onboarding
    ageGroup: user.ageGroup as AgeGroupId | null || null,
    region: user.region as RegionId | null || null,
    interests: (user.interests || []) as InterestId[],
    tone: user.tone as ToneId | null || null,
    onboardingCompleted: user.onboardingCompleted,
    
    // Stats
    xp: user.xp ?? undefined,
    level: user.level ?? undefined,
    streakCount: user.streakCount ?? undefined,
    questionsAnswered: user.questionsAnswered ?? undefined,
    
    // Metadata
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

/**
 * Onboarding-specific profile subset
 */
export function toOnboardingProfile(user: PrismaUser): OnboardingProfile {
  return {
    ageGroup: user.ageGroup as AgeGroupId | undefined,
    region: user.region as RegionId | undefined,
    interests: (user.interests || []) as InterestId[],
    tone: user.tone as ToneId | undefined,
    onboardingCompleted: user.onboardingCompleted ?? false,
  };
}

