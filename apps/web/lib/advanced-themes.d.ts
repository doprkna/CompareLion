/**
 * Advanced Profile Theming (v0.8.7)
 *
 * PLACEHOLDER: Expanded theme system with seasonal packs.
 */
export interface ThemePackData {
    themeId: string;
    name: string;
    description: string;
    type: "default" | "seasonal" | "premium" | "event";
    rarity: "common" | "rare" | "epic" | "legendary";
    isSeasonal: boolean;
    seasonType?: "spring" | "summer" | "fall" | "winter";
    gradientConfig: {
        from: string;
        via?: string;
        to: string;
        angle?: number;
    };
    particleConfig?: {
        type: "snow" | "sakura" | "stars" | "embers" | "leaves";
        color: string;
        density: number;
        speed: number;
    };
    animationConfig?: {
        duration: string;
        easing: string;
        effects: string[];
    };
    unlockLevel: number;
    unlockCondition?: string;
    goldCost?: number;
    diamondCost?: number;
    vipOnly: boolean;
}
export declare const THEME_PACKS: ThemePackData[];
export declare function getCurrentSeason(): "spring" | "summer" | "fall" | "winter";
export declare function getSeasonalThemes(): ThemePackData[];
export declare function canUnlockTheme(theme: ThemePackData, userLevel: number, isVip: boolean): {
    canUnlock: boolean;
    reason?: string;
};
