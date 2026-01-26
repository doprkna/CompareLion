/**
 * Onboarding Type Definitions
 * v0.24.0 - Phase I: Smart Onboarding & Glossary
 */
export declare const AGE_GROUPS: readonly [{
    readonly id: "kid";
    readonly label: "👶 Kid (0–12)";
    readonly desc: "Homework, cartoons, and trying to beat your older sibling at Mario Kart.";
    readonly shortLabel: "Kid";
    readonly emoji: "👶";
}, {
    readonly id: "teen";
    readonly label: "🧑 Teen (13–17)";
    readonly desc: "Drama, TikTok, and pretending you're not awkward.";
    readonly shortLabel: "Teen";
    readonly emoji: "🧑";
}, {
    readonly id: "youngAdult";
    readonly label: "🧑‍🎓 Young Adult (18–24)";
    readonly desc: "Cheap beer, big dreams, and zero idea how taxes work.";
    readonly shortLabel: "Young Adult";
    readonly emoji: "🧑‍🎓";
}, {
    readonly id: "adult";
    readonly label: "🧑‍💼 Adult (25–39)";
    readonly desc: "Career hustling, family juggling, and Googling 'easy healthy recipes.'";
    readonly shortLabel: "Adult";
    readonly emoji: "🧑‍💼";
}, {
    readonly id: "mature";
    readonly label: "🧓 Mature (40–59)";
    readonly desc: "Mortgage boss fight, back pain DLC, and kids who know more tech than you.";
    readonly shortLabel: "Mature";
    readonly emoji: "🧓";
}, {
    readonly id: "senior";
    readonly label: "👴 Senior (60+)";
    readonly desc: "Retirement speedrun, health power-ups, and grandkids as daily entertainment.";
    readonly shortLabel: "Senior";
    readonly emoji: "👴";
}];
export type AgeGroupId = typeof AGE_GROUPS[number]['id'];
export declare const REGIONS: readonly [{
    readonly id: "GLOBAL";
    readonly label: "🌍 Global Traveler";
    readonly flag: "🌍";
}, {
    readonly id: "EU-CZ";
    readonly label: "🇨🇿 Czechia";
    readonly flag: "🇨🇿";
}, {
    readonly id: "EU-PL";
    readonly label: "🇵🇱 Poland";
    readonly flag: "🇵🇱";
}, {
    readonly id: "EU-SK";
    readonly label: "🇸🇰 Slovakia";
    readonly flag: "🇸🇰";
}, {
    readonly id: "EU-DE";
    readonly label: "🇩🇪 Germany";
    readonly flag: "🇩🇪";
}, {
    readonly id: "EU-FR";
    readonly label: "🇫🇷 France";
    readonly flag: "🇫🇷";
}, {
    readonly id: "EU-GB";
    readonly label: "🇬🇧 United Kingdom";
    readonly flag: "🇬🇧";
}, {
    readonly id: "US";
    readonly label: "🇺🇸 United States";
    readonly flag: "🇺🇸";
}, {
    readonly id: "CA";
    readonly label: "🇨🇦 Canada";
    readonly flag: "🇨🇦";
}, {
    readonly id: "AU";
    readonly label: "🇦🇺 Australia";
    readonly flag: "🇦🇺";
}];
export type RegionId = typeof REGIONS[number]['id'];
export declare const INTERESTS: readonly [{
    readonly id: "art";
    readonly label: "Art";
    readonly emoji: "🎨";
}, {
    readonly id: "games";
    readonly label: "Games";
    readonly emoji: "🎮";
}, {
    readonly id: "psychology";
    readonly label: "Psychology";
    readonly emoji: "💬";
}, {
    readonly id: "food";
    readonly label: "Food";
    readonly emoji: "🍔";
}, {
    readonly id: "memes";
    readonly label: "Memes";
    readonly emoji: "🧠";
}, {
    readonly id: "animals";
    readonly label: "Animals";
    readonly emoji: "🐶";
}, {
    readonly id: "music";
    readonly label: "Music";
    readonly emoji: "🎧";
}, {
    readonly id: "lifestyle";
    readonly label: "Lifestyle";
    readonly emoji: "🪩";
}, {
    readonly id: "tech";
    readonly label: "Tech";
    readonly emoji: "💻";
}, {
    readonly id: "sports";
    readonly label: "Sports";
    readonly emoji: "⚽";
}, {
    readonly id: "movies";
    readonly label: "Movies";
    readonly emoji: "🎬";
}, {
    readonly id: "books";
    readonly label: "Books";
    readonly emoji: "📚";
}];
export type InterestId = typeof INTERESTS[number]['id'];
export declare const TONE_OPTIONS: readonly [{
    readonly id: "funny";
    readonly label: "😂 Funny";
    readonly desc: "I want jokes, puns, and light-hearted chaos";
    readonly emoji: "😂";
}, {
    readonly id: "deep";
    readonly label: "🤔 Deep";
    readonly desc: "Give me thought-provoking questions and wisdom";
    readonly emoji: "🤔";
}, {
    readonly id: "random";
    readonly label: "🎲 Random";
    readonly desc: "Surprise me with wild and unexpected stuff";
    readonly emoji: "🎲";
}, {
    readonly id: "roast";
    readonly label: "🔥 Roast me";
    readonly desc: "I can handle the heat — bring the sass";
    readonly emoji: "🔥";
}];
export type ToneId = typeof TONE_OPTIONS[number]['id'];
export interface OnboardingData {
    ageGroup?: AgeGroupId;
    region?: RegionId;
    interests?: InterestId[];
    tone?: ToneId;
}
export interface OnboardingProfile extends OnboardingData {
    onboardingCompleted: boolean;
}
/**
 * Get age group by ID
 */
export declare function getAgeGroup(id?: string | null): {
    readonly id: "kid";
    readonly label: "👶 Kid (0–12)";
    readonly desc: "Homework, cartoons, and trying to beat your older sibling at Mario Kart.";
    readonly shortLabel: "Kid";
    readonly emoji: "👶";
} | {
    readonly id: "teen";
    readonly label: "🧑 Teen (13–17)";
    readonly desc: "Drama, TikTok, and pretending you're not awkward.";
    readonly shortLabel: "Teen";
    readonly emoji: "🧑";
} | {
    readonly id: "youngAdult";
    readonly label: "🧑‍🎓 Young Adult (18–24)";
    readonly desc: "Cheap beer, big dreams, and zero idea how taxes work.";
    readonly shortLabel: "Young Adult";
    readonly emoji: "🧑‍🎓";
} | {
    readonly id: "adult";
    readonly label: "🧑‍💼 Adult (25–39)";
    readonly desc: "Career hustling, family juggling, and Googling 'easy healthy recipes.'";
    readonly shortLabel: "Adult";
    readonly emoji: "🧑‍💼";
} | {
    readonly id: "mature";
    readonly label: "🧓 Mature (40–59)";
    readonly desc: "Mortgage boss fight, back pain DLC, and kids who know more tech than you.";
    readonly shortLabel: "Mature";
    readonly emoji: "🧓";
} | {
    readonly id: "senior";
    readonly label: "👴 Senior (60+)";
    readonly desc: "Retirement speedrun, health power-ups, and grandkids as daily entertainment.";
    readonly shortLabel: "Senior";
    readonly emoji: "👴";
} | null;
/**
 * Get region by ID
 */
export declare function getRegion(id?: string | null): {
    readonly id: "GLOBAL";
    readonly label: "🌍 Global Traveler";
    readonly flag: "🌍";
} | {
    readonly id: "EU-CZ";
    readonly label: "🇨🇿 Czechia";
    readonly flag: "🇨🇿";
} | {
    readonly id: "EU-PL";
    readonly label: "🇵🇱 Poland";
    readonly flag: "🇵🇱";
} | {
    readonly id: "EU-SK";
    readonly label: "🇸🇰 Slovakia";
    readonly flag: "🇸🇰";
} | {
    readonly id: "EU-DE";
    readonly label: "🇩🇪 Germany";
    readonly flag: "🇩🇪";
} | {
    readonly id: "EU-FR";
    readonly label: "🇫🇷 France";
    readonly flag: "🇫🇷";
} | {
    readonly id: "EU-GB";
    readonly label: "🇬🇧 United Kingdom";
    readonly flag: "🇬🇧";
} | {
    readonly id: "US";
    readonly label: "🇺🇸 United States";
    readonly flag: "🇺🇸";
} | {
    readonly id: "CA";
    readonly label: "🇨🇦 Canada";
    readonly flag: "🇨🇦";
} | {
    readonly id: "AU";
    readonly label: "🇦🇺 Australia";
    readonly flag: "🇦🇺";
} | null;
/**
 * Get tone option by ID
 */
export declare function getTone(id?: string | null): {
    readonly id: "funny";
    readonly label: "😂 Funny";
    readonly desc: "I want jokes, puns, and light-hearted chaos";
    readonly emoji: "😂";
} | {
    readonly id: "deep";
    readonly label: "🤔 Deep";
    readonly desc: "Give me thought-provoking questions and wisdom";
    readonly emoji: "🤔";
} | {
    readonly id: "random";
    readonly label: "🎲 Random";
    readonly desc: "Surprise me with wild and unexpected stuff";
    readonly emoji: "🎲";
} | {
    readonly id: "roast";
    readonly label: "🔥 Roast me";
    readonly desc: "I can handle the heat — bring the sass";
    readonly emoji: "🔥";
} | null;
/**
 * Get interests by IDs
 */
export declare function getInterests(ids?: string[] | null): ({
    readonly id: "art";
    readonly label: "Art";
    readonly emoji: "🎨";
} | {
    readonly id: "games";
    readonly label: "Games";
    readonly emoji: "🎮";
} | {
    readonly id: "psychology";
    readonly label: "Psychology";
    readonly emoji: "💬";
} | {
    readonly id: "food";
    readonly label: "Food";
    readonly emoji: "🍔";
} | {
    readonly id: "memes";
    readonly label: "Memes";
    readonly emoji: "🧠";
} | {
    readonly id: "animals";
    readonly label: "Animals";
    readonly emoji: "🐶";
} | {
    readonly id: "music";
    readonly label: "Music";
    readonly emoji: "🎧";
} | {
    readonly id: "lifestyle";
    readonly label: "Lifestyle";
    readonly emoji: "🪩";
} | {
    readonly id: "tech";
    readonly label: "Tech";
    readonly emoji: "💻";
} | {
    readonly id: "sports";
    readonly label: "Sports";
    readonly emoji: "⚽";
} | {
    readonly id: "movies";
    readonly label: "Movies";
    readonly emoji: "🎬";
} | {
    readonly id: "books";
    readonly label: "Books";
    readonly emoji: "📚";
})[];
/**
 * Validate onboarding data
 */
export declare function validateOnboardingData(data: OnboardingData): {
    valid: boolean;
    errors: string[];
};
/**
 * Auto-detect region from browser
 */
export declare function detectRegionFromBrowser(): RegionId;
