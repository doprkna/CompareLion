/**
 * Onboarding Type Definitions
 * v0.24.0 - Phase I: Smart Onboarding & Glossary
 */

// ============================================================================
// AGE GROUPS
// ============================================================================

export const AGE_GROUPS = [
  {
    id: "kid",
    label: "👶 Kid (0–12)",
    desc: "Homework, cartoons, and trying to beat your older sibling at Mario Kart.",
    shortLabel: "Kid",
    emoji: "👶",
  },
  {
    id: "teen",
    label: "🧑 Teen (13–17)",
    desc: "Drama, TikTok, and pretending you're not awkward.",
    shortLabel: "Teen",
    emoji: "🧑",
  },
  {
    id: "youngAdult",
    label: "🧑‍🎓 Young Adult (18–24)",
    desc: "Cheap beer, big dreams, and zero idea how taxes work.",
    shortLabel: "Young Adult",
    emoji: "🧑‍🎓",
  },
  {
    id: "adult",
    label: "🧑‍💼 Adult (25–39)",
    desc: "Career hustling, family juggling, and Googling 'easy healthy recipes.'",
    shortLabel: "Adult",
    emoji: "🧑‍💼",
  },
  {
    id: "mature",
    label: "🧓 Mature (40–59)",
    desc: "Mortgage boss fight, back pain DLC, and kids who know more tech than you.",
    shortLabel: "Mature",
    emoji: "🧓",
  },
  {
    id: "senior",
    label: "👴 Senior (60+)",
    desc: "Retirement speedrun, health power-ups, and grandkids as daily entertainment.",
    shortLabel: "Senior",
    emoji: "👴",
  },
] as const;

export type AgeGroupId = typeof AGE_GROUPS[number]['id'];

// ============================================================================
// REGIONS
// ============================================================================

export const REGIONS = [
  { id: "GLOBAL", label: "🌍 Global Traveler", flag: "🌍" },
  { id: "EU-CZ", label: "🇨🇿 Czechia", flag: "🇨🇿" },
  { id: "EU-PL", label: "🇵🇱 Poland", flag: "🇵🇱" },
  { id: "EU-SK", label: "🇸🇰 Slovakia", flag: "🇸🇰" },
  { id: "EU-DE", label: "🇩🇪 Germany", flag: "🇩🇪" },
  { id: "EU-FR", label: "🇫🇷 France", flag: "🇫🇷" },
  { id: "EU-GB", label: "🇬🇧 United Kingdom", flag: "🇬🇧" },
  { id: "US", label: "🇺🇸 United States", flag: "🇺🇸" },
  { id: "CA", label: "🇨🇦 Canada", flag: "🇨🇦" },
  { id: "AU", label: "🇦🇺 Australia", flag: "🇦🇺" },
] as const;

export type RegionId = typeof REGIONS[number]['id'];

// ============================================================================
// INTERESTS
// ============================================================================

export const INTERESTS = [
  { id: "art", label: "Art", emoji: "🎨" },
  { id: "games", label: "Games", emoji: "🎮" },
  { id: "psychology", label: "Psychology", emoji: "💬" },
  { id: "food", label: "Food", emoji: "🍔" },
  { id: "memes", label: "Memes", emoji: "🧠" },
  { id: "animals", label: "Animals", emoji: "🐶" },
  { id: "music", label: "Music", emoji: "🎧" },
  { id: "lifestyle", label: "Lifestyle", emoji: "🪩" },
  { id: "tech", label: "Tech", emoji: "💻" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "movies", label: "Movies", emoji: "🎬" },
  { id: "books", label: "Books", emoji: "📚" },
] as const;

export type InterestId = typeof INTERESTS[number]['id'];

// ============================================================================
// TONE PREFERENCES
// ============================================================================

export const TONE_OPTIONS = [
  { 
    id: "funny", 
    label: "😂 Funny", 
    desc: "I want jokes, puns, and light-hearted chaos",
    emoji: "😂"
  },
  { 
    id: "deep", 
    label: "🤔 Deep", 
    desc: "Give me thought-provoking questions and wisdom",
    emoji: "🤔"
  },
  { 
    id: "random", 
    label: "🎲 Random", 
    desc: "Surprise me with wild and unexpected stuff",
    emoji: "🎲"
  },
  { 
    id: "roast", 
    label: "🔥 Roast me", 
    desc: "I can handle the heat — bring the sass",
    emoji: "🔥"
  },
] as const;

export type ToneId = typeof TONE_OPTIONS[number]['id'];

// ============================================================================
// ONBOARDING DATA
// ============================================================================

export interface OnboardingData {
  ageGroup?: AgeGroupId;
  region?: RegionId;
  interests?: InterestId[];
  tone?: ToneId;
}

export interface OnboardingProfile extends OnboardingData {
  onboardingCompleted: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get age group by ID
 */
export function getAgeGroup(id?: string | null) {
  if (!id) return null;
  return AGE_GROUPS.find(g => g.id === id) || null;
}

/**
 * Get region by ID
 */
export function getRegion(id?: string | null) {
  if (!id) return null;
  return REGIONS.find(r => r.id === id) || null;
}

/**
 * Get tone option by ID
 */
export function getTone(id?: string | null) {
  if (!id) return null;
  return TONE_OPTIONS.find(t => t.id === id) || null;
}

/**
 * Get interests by IDs
 */
export function getInterests(ids?: string[] | null) {
  if (!ids || ids.length === 0) return [];
  return INTERESTS.filter(i => ids.includes(i.id));
}

/**
 * Validate onboarding data
 */
export function validateOnboardingData(data: OnboardingData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (data.ageGroup && !AGE_GROUPS.find(g => g.id === data.ageGroup)) {
    errors.push('Invalid age group');
  }
  
  if (data.region && !REGIONS.find(r => r.id === data.region)) {
    errors.push('Invalid region');
  }
  
  if (data.tone && !TONE_OPTIONS.find(t => t.id === data.tone)) {
    errors.push('Invalid tone');
  }
  
  if (data.interests) {
    const invalidInterests = data.interests.filter(
      i => !INTERESTS.find(interest => interest.id === i)
    );
    if (invalidInterests.length > 0) {
      errors.push(`Invalid interests: ${invalidInterests.join(', ')}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Auto-detect region from browser
 */
export function detectRegionFromBrowser(): RegionId {
  if (typeof window === 'undefined') return 'GLOBAL';
  
  const locale = navigator.language || (navigator as any).userLanguage;
  
  // Map locale to region
  const regionMap: Record<string, RegionId> = {
    'cs': 'EU-CZ',
    'cs-CZ': 'EU-CZ',
    'pl': 'EU-PL',
    'pl-PL': 'EU-PL',
    'sk': 'EU-SK',
    'sk-SK': 'EU-SK',
    'de': 'EU-DE',
    'de-DE': 'EU-DE',
    'fr': 'EU-FR',
    'fr-FR': 'EU-FR',
    'en-GB': 'EU-GB',
    'en-US': 'US',
    'en-CA': 'CA',
    'en-AU': 'AU',
  };
  
  return regionMap[locale] || 'GLOBAL';
}

