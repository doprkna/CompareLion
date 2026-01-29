/**
 * User Type Definitions
 * v0.24.0 - Phase I: Extended with onboarding profile
 */
/**
 * Convert Prisma User to UserProfile
 */
export function toUserProfile(user) {
    return {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        // Onboarding
        ageGroup: user.ageGroup || null,
        region: user.region || null,
        interests: (user.interests || []),
        tone: user.tone || null,
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
export function toOnboardingProfile(user) {
    return {
        ageGroup: user.ageGroup,
        region: user.region,
        interests: (user.interests || []),
        tone: user.tone,
        onboardingCompleted: user.onboardingCompleted ?? false,
    };
}
