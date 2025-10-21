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

export const THEME_PACKS: ThemePackData[] = [
  {
    themeId: "default",
    name: "Classic",
    description: "The timeless default theme",
    type: "default",
    rarity: "common",
    isSeasonal: false,
    gradientConfig: {
      from: "#1e1b4b",
      to: "#0c0a1f",
    },
    unlockLevel: 1,
    vipOnly: false,
  },
  {
    themeId: "sakura",
    name: "Sakura Dreams",
    description: "Cherry blossoms in full bloom",
    type: "seasonal",
    rarity: "epic",
    isSeasonal: true,
    seasonType: "spring",
    gradientConfig: {
      from: "#fce7f3",
      via: "#fbcfe8",
      to: "#f9a8d4",
      angle: 135,
    },
    particleConfig: {
      type: "sakura",
      color: "#ec4899",
      density: 30,
      speed: 2,
    },
    animationConfig: {
      duration: "20s",
      easing: "ease-in-out",
      effects: ["float", "fade"],
    },
    unlockLevel: 10,
    goldCost: 1000,
    vipOnly: false,
  },
  {
    themeId: "cyber",
    name: "Cyber Neon",
    description: "Electric future aesthetic",
    type: "premium",
    rarity: "legendary",
    isSeasonal: false,
    gradientConfig: {
      from: "#06b6d4",
      via: "#8b5cf6",
      to: "#ec4899",
      angle: 45,
    },
    particleConfig: {
      type: "stars",
      color: "#06b6d4",
      density: 50,
      speed: 4,
    },
    animationConfig: {
      duration: "15s",
      easing: "linear",
      effects: ["pulse", "glow"],
    },
    unlockLevel: 25,
    diamondCost: 500,
    vipOnly: true,
  },
  {
    themeId: "forest",
    name: "Enchanted Forest",
    description: "Deep woods mystique",
    type: "seasonal",
    rarity: "rare",
    isSeasonal: true,
    seasonType: "summer",
    gradientConfig: {
      from: "#064e3b",
      via: "#047857",
      to: "#10b981",
      angle: 180,
    },
    particleConfig: {
      type: "leaves",
      color: "#10b981",
      density: 20,
      speed: 1.5,
    },
    unlockLevel: 15,
    goldCost: 800,
    vipOnly: false,
  },
  {
    themeId: "lava",
    name: "Molten Core",
    description: "Burning with intensity",
    type: "premium",
    rarity: "epic",
    isSeasonal: false,
    gradientConfig: {
      from: "#7c2d12",
      via: "#dc2626",
      to: "#f97316",
      angle: 90,
    },
    particleConfig: {
      type: "embers",
      color: "#f97316",
      density: 40,
      speed: 3,
    },
    animationConfig: {
      duration: "10s",
      easing: "ease-in-out",
      effects: ["flicker", "rise"],
    },
    unlockLevel: 30,
    diamondCost: 300,
    vipOnly: false,
  },
  {
    themeId: "winter",
    name: "Frozen Tundra",
    description: "Eternal winter wonderland",
    type: "seasonal",
    rarity: "epic",
    isSeasonal: true,
    seasonType: "winter",
    gradientConfig: {
      from: "#0c4a6e",
      via: "#0ea5e9",
      to: "#f0f9ff",
      angle: 225,
    },
    particleConfig: {
      type: "snow",
      color: "#f0f9ff",
      density: 60,
      speed: 1,
    },
    animationConfig: {
      duration: "30s",
      easing: "ease-out",
      effects: ["drift", "shimmer"],
    },
    unlockLevel: 20,
    goldCost: 1200,
    vipOnly: false,
  },
];

export function getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export function getSeasonalThemes() {
  const season = getCurrentSeason();
  return THEME_PACKS.filter(
    (t) => t.isSeasonal && t.seasonType === season
  );
}

export function canUnlockTheme(
  theme: ThemePackData,
  userLevel: number,
  isVip: boolean
): { canUnlock: boolean; reason?: string } {
  if (theme.vipOnly && !isVip) {
    return { canUnlock: false, reason: "VIP subscription required" };
  }
  
  if (userLevel < theme.unlockLevel) {
    return { canUnlock: false, reason: `Reach level ${theme.unlockLevel}` };
  }
  
  return { canUnlock: true };
}










