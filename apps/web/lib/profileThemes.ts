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
  unlockMethod: string; // How to earn it
  price?: number; // Gold cost (if purchasable)
  seasonal?: string; // "spring", "summer", "fall", "winter"
  rarity: "common" | "rare" | "epic" | "legendary";
  
  // Visual properties
  gradient: {
    from: string;
    via?: string;
    to: string;
  };
  particleColor: string;
  accentColor: string;
  textShadow?: string;
  
  // Animation properties
  animationDuration?: string;
  glowIntensity?: number;
}

export const PROFILE_THEMES: ProfileTheme[] = [
  // ========== DEFAULT / COMMON ==========
  {
    id: "default",
    name: "Classic",
    emoji: "⚪",
    description: "The original PareL look",
    unlockMethod: "Default (always available)",
    rarity: "common",
    gradient: {
      from: "#1e293b",
      to: "#0f172a",
    },
    particleColor: "#60a5fa",
    accentColor: "#3b82f6",
  },

  {
    id: "midnight",
    name: "Midnight",
    emoji: "🌙",
    description: "Deep blue darkness",
    unlockMethod: "Reach level 5",
    rarity: "common",
    gradient: {
      from: "#1e1b4b",
      to: "#0c0a1f",
    },
    particleColor: "#818cf8",
    accentColor: "#6366f1",
  },

  // ========== RARE THEMES ==========
  {
    id: "cosmic",
    name: "Cosmic Nebula",
    emoji: "🌌",
    description: "Starry purple expanse",
    unlockMethod: "Complete 50 questions",
    rarity: "rare",
    gradient: {
      from: "#4c1d95",
      via: "#6b21a8",
      to: "#1e1b4b",
    },
    particleColor: "#c084fc",
    accentColor: "#a855f7",
    textShadow: "0 0 20px rgba(168, 85, 247, 0.5)",
  },

  {
    id: "forest",
    name: "Enchanted Forest",
    emoji: "🌲",
    description: "Deep green mystique",
    unlockMethod: "Reach level 10",
    price: 500,
    rarity: "rare",
    gradient: {
      from: "#14532d",
      via: "#065f46",
      to: "#064e3b",
    },
    particleColor: "#34d399",
    accentColor: "#10b981",
  },

  {
    id: "ocean",
    name: "Deep Ocean",
    emoji: "🌊",
    description: "Tranquil aquatic depths",
    unlockMethod: "Unlock 10 achievements",
    rarity: "rare",
    gradient: {
      from: "#0c4a6e",
      via: "#075985",
      to: "#082f49",
    },
    particleColor: "#22d3ee",
    accentColor: "#06b6d4",
  },

  // ========== EPIC THEMES ==========
  {
    id: "fire",
    name: "Blazing Inferno",
    emoji: "🔥",
    description: "Intense burning energy",
    unlockMethod: "Win 20 challenges",
    price: 1000,
    rarity: "epic",
    gradient: {
      from: "#991b1b",
      via: "#dc2626",
      to: "#7c2d12",
    },
    particleColor: "#fb923c",
    accentColor: "#f97316",
    textShadow: "0 0 30px rgba(249, 115, 22, 0.7)",
    glowIntensity: 2,
  },

  {
    id: "aurora",
    name: "Aurora Borealis",
    emoji: "✨",
    description: "Shimmering northern lights",
    unlockMethod: "Achieve Polymath archetype",
    rarity: "epic",
    gradient: {
      from: "#1e3a8a",
      via: "#7c3aed",
      to: "#059669",
    },
    particleColor: "#a78bfa",
    accentColor: "#8b5cf6",
    animationDuration: "10s",
    glowIntensity: 3,
  },

  {
    id: "sunset",
    name: "Golden Sunset",
    emoji: "🌅",
    description: "Warm evening glow",
    unlockMethod: "Maintain 30-day streak",
    price: 1500,
    seasonal: "summer",
    rarity: "epic",
    gradient: {
      from: "#ea580c",
      via: "#dc2626",
      to: "#7c2d12",
    },
    particleColor: "#fbbf24",
    accentColor: "#f59e0b",
  },

  // ========== LEGENDARY THEMES ==========
  {
    id: "rainbow",
    name: "Prismatic",
    emoji: "🌈",
    description: "Full spectrum brilliance",
    unlockMethod: "Unlock all archetypes",
    rarity: "legendary",
    gradient: {
      from: "#dc2626",
      via: "#8b5cf6",
      to: "#06b6d4",
    },
    particleColor: "#f472b6",
    accentColor: "#ec4899",
    animationDuration: "8s",
    glowIntensity: 4,
  },

  {
    id: "galaxy",
    name: "Galactic Core",
    emoji: "🪐",
    description: "Center of the universe",
    unlockMethod: "Reach level 50",
    price: 5000,
    rarity: "legendary",
    gradient: {
      from: "#1e1b4b",
      via: "#581c87",
      to: "#18181b",
    },
    particleColor: "#f0abfc",
    accentColor: "#d946ef",
    textShadow: "0 0 40px rgba(217, 70, 239, 0.8)",
    glowIntensity: 5,
  },

  // ========== SEASONAL THEMES ==========
  {
    id: "cherry_blossom",
    name: "Cherry Blossom",
    emoji: "🌸",
    description: "Spring has arrived",
    unlockMethod: "Available in Spring",
    price: 800,
    seasonal: "spring",
    rarity: "epic",
    gradient: {
      from: "#9f1239",
      via: "#db2777",
      to: "#831843",
    },
    particleColor: "#fda4af",
    accentColor: "#f472b6",
  },

  {
    id: "autumn",
    name: "Autumn Leaves",
    emoji: "🍂",
    description: "Fall foliage",
    unlockMethod: "Available in Fall",
    price: 800,
    seasonal: "fall",
    rarity: "epic",
    gradient: {
      from: "#92400e",
      via: "#ea580c",
      to: "#78350f",
    },
    particleColor: "#fbbf24",
    accentColor: "#f59e0b",
  },

  {
    id: "winter",
    name: "Frozen Tundra",
    emoji: "❄️",
    description: "Icy winter wonderland",
    unlockMethod: "Available in Winter",
    price: 800,
    seasonal: "winter",
    rarity: "epic",
    gradient: {
      from: "#0c4a6e",
      via: "#0369a1",
      to: "#075985",
    },
    particleColor: "#e0f2fe",
    accentColor: "#0ea5e9",
  },
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): ProfileTheme | undefined {
  return PROFILE_THEMES.find((t) => t.id === id);
}

/**
 * Get themes by rarity
 */
export function getThemesByRarity(rarity: ProfileTheme["rarity"]): ProfileTheme[] {
  return PROFILE_THEMES.filter((t) => t.rarity === rarity);
}

/**
 * Get current seasonal themes
 */
export function getSeasonalThemes(): ProfileTheme[] {
  const month = new Date().getMonth();
  let season: string;

  if (month >= 2 && month <= 4) season = "spring";
  else if (month >= 5 && month <= 7) season = "summer";
  else if (month >= 8 && month <= 10) season = "fall";
  else season = "winter";

  return PROFILE_THEMES.filter((t) => t.seasonal === season);
}

/**
 * Check if user meets unlock criteria
 */
export function canUnlockTheme(theme: ProfileTheme, userStats: {
  level: number;
  questionsAnswered: number;
  achievementsCount: number;
  challengesWon: number;
  archetype: string;
  streakDays: number;
}): { canUnlock: boolean; reason?: string } {
  // Default is always available
  if (theme.id === "default") return { canUnlock: true };

  // Level-based unlocks
  if (theme.id === "midnight" && userStats.level < 5) {
    return { canUnlock: false, reason: "Reach level 5" };
  }
  if (theme.id === "forest" && userStats.level < 10) {
    return { canUnlock: false, reason: "Reach level 10" };
  }
  if (theme.id === "galaxy" && userStats.level < 50) {
    return { canUnlock: false, reason: "Reach level 50" };
  }

  // Stat-based unlocks
  if (theme.id === "cosmic" && userStats.questionsAnswered < 50) {
    return { canUnlock: false, reason: "Complete 50 questions" };
  }
  if (theme.id === "ocean" && userStats.achievementsCount < 10) {
    return { canUnlock: false, reason: "Unlock 10 achievements" };
  }
  if (theme.id === "fire" && userStats.challengesWon < 20) {
    return { canUnlock: false, reason: "Win 20 challenges" };
  }
  if (theme.id === "sunset" && userStats.streakDays < 30) {
    return { canUnlock: false, reason: "Maintain 30-day streak" };
  }

  // Archetype-based unlocks
  if (theme.id === "aurora" && userStats.archetype !== "The Polymath") {
    return { canUnlock: false, reason: "Achieve Polymath archetype" };
  }
  if (theme.id === "rainbow") {
    // Would need to check if all archetypes unlocked
    return { canUnlock: false, reason: "Unlock all archetypes" };
  }

  return { canUnlock: true };
}










