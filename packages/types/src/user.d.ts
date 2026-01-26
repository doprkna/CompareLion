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
    ageGroup?: AgeGroupId | null;
    region?: RegionId | null;
    interests?: InterestId[];
    tone?: ToneId | null;
    onboardingCompleted?: boolean;
    xp?: number;
    level?: number;
    streakCount?: number;
    questionsAnswered?: number;
    createdAt?: Date;
    lastLoginAt?: Date | null;
}
/**
 * Convert Prisma User to UserProfile
 */
export declare function toUserProfile(user: PrismaUser): UserProfile;
/**
 * Onboarding-specific profile subset
 */
export declare function toOnboardingProfile(user: PrismaUser): OnboardingProfile;
