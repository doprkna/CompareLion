/**
 * Profile Theme System
 *
 * Dynamic gradient backgrounds, particle effects, and visual polish.
 */
export interface ProfileTheme {
    id: string;
    name: string;
    emoji: string;
    description: string;
    unlockMethod: string;
    price?: number;
    seasonal?: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    gradient: {
        from: string;
        via?: string;
        to: string;
    };
    particleColor: string;
    accentColor: string;
    textShadow?: string;
    animationDuration?: string;
    glowIntensity?: number;
}
export declare const PROFILE_THEMES: ProfileTheme[];
/**
 * Get theme by ID
 */
export declare function getThemeById(id: string): ProfileTheme | undefined;
/**
 * Get themes by rarity
 */
export declare function getThemesByRarity(rarity: ProfileTheme["rarity"]): ProfileTheme[];
/**
 * Get current seasonal themes
 */
export declare function getSeasonalThemes(): ProfileTheme[];
/**
 * Check if user meets unlock criteria
 */
export declare function canUnlockTheme(theme: ProfileTheme, userStats: {
    level: number;
    questionsAnswered: number;
    achievementsCount: number;
    challengesWon: number;
    archetype: string;
    streakDays: number;
}): {
    canUnlock: boolean;
    reason?: string;
};
