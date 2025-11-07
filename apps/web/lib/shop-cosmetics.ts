/**
 * Shop Cosmetics Integration (v0.8.9)
 * 
 * PLACEHOLDER: Unified shop for avatar parts, themes, and collectibles.
 */

export interface CosmeticItem {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  cosmeticType: "avatar_layer" | "theme" | "aura" | "frame" | "particle";
  cosmeticSubtype?: string;
  icon: string;
  visualConfig?: {
    colors?: string[];
    pattern?: string;
    animation?: string;
  };
  goldPrice?: number;
  diamondPrice?: number;
  eventCurrency?: string;
  eventPrice?: number;
  isFeatured: boolean;
  isLimited: boolean;
  availableUntil?: Date;
  isOwned?: boolean;
  isEquipped?: boolean;
}

export const RARITY_COLORS = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export const RARITY_GLOW = {
  common: "0 0 10px rgba(156, 163, 175, 0.3)",
  uncommon: "0 0 15px rgba(34, 197, 94, 0.5)",
  rare: "0 0 20px rgba(59, 130, 246, 0.6)",
  epic: "0 0 25px rgba(168, 85, 247, 0.7)",
  legendary: "0 0 30px rgba(245, 158, 11, 0.8)",
};

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // Avatar Layers
  {
    id: "hair_mystical",
    name: "Mystical Aura Hair",
    description: "Flowing ethereal locks",
    rarity: "epic",
    cosmeticType: "avatar_layer",
    cosmeticSubtype: "hair",
    icon: "💫",
    visualConfig: {
      colors: ["#a855f7", "#ec4899"],
      animation: "float",
    },
    diamondPrice: 200,
    isFeatured: true,
    isLimited: false,
  },
  {
    id: "weapon_cosmic_sword",
    name: "Cosmic Blade",
    description: "Forged from stardust",
    rarity: "legendary",
    cosmeticType: "avatar_layer",
    cosmeticSubtype: "weapon",
    icon: "⚔️",
    visualConfig: {
      colors: ["#06b6d4", "#8b5cf6"],
      pattern: "stars",
      animation: "glow-pulse",
    },
    diamondPrice: 500,
    isFeatured: true,
    isLimited: true,
    availableUntil: new Date("2025-12-31"),
  },
  
  // Themes
  {
    id: "theme_aurora",
    name: "Aurora Borealis Theme",
    description: "Dance of northern lights",
    rarity: "epic",
    cosmeticType: "theme",
    icon: "🌌",
    visualConfig: {
      colors: ["#06b6d4", "#8b5cf6", "#ec4899"],
      animation: "gradient-shift",
    },
    goldPrice: 2000,
    diamondPrice: 150,
    isFeatured: true,
    isLimited: false,
  },
  
  // Auras
  {
    id: "aura_courage_flame",
    name: "Courage Flame",
    description: "Burning determination",
    rarity: "rare",
    cosmeticType: "aura",
    icon: "🔥",
    visualConfig: {
      colors: ["#dc2626", "#f97316"],
      pattern: "flame",
      animation: "flicker",
    },
    goldPrice: 1500,
    isFeatured: false,
    isLimited: false,
  },
  {
    id: "aura_balance",
    name: "Balance Aura",
    description: "Perfect equilibrium",
    rarity: "epic",
    cosmeticType: "aura",
    icon: "⚖️",
    visualConfig: {
      colors: ["#14b8a6", "#06b6d4"],
      pattern: "orbit",
      animation: "rotate",
    },
    diamondPrice: 180,
    isFeatured: false,
    isLimited: false,
  },
  
  // Frames
  {
    id: "frame_champion",
    name: "Champion's Frame",
    description: "For the victorious",
    rarity: "legendary",
    cosmeticType: "frame",
    icon: "🏆",
    visualConfig: {
      colors: ["#f59e0b", "#eab308"],
      pattern: "ornate",
      animation: "shimmer",
    },
    diamondPrice: 400,
    isFeatured: true,
    isLimited: false,
  },
  
  // Particles
  {
    id: "particle_sakura",
    name: "Sakura Petals",
    description: "Gentle cherry blossoms",
    rarity: "rare",
    cosmeticType: "particle",
    icon: "🌸",
    visualConfig: {
      colors: ["#ec4899"],
      pattern: "petal",
      animation: "drift",
    },
    eventCurrency: "spring_tokens",
    eventPrice: 50,
    isFeatured: false,
    isLimited: true,
    availableUntil: new Date("2025-05-31"),
  },
];

export function filterCosmetics(
  items: CosmeticItem[],
  options: {
    type?: string;
    rarity?: string;
    ownedOnly?: boolean;
    sortBy?: "rarity" | "price" | "name";
  }
) {
  let filtered = [...items];
  
  if (options.type) {
    filtered = filtered.filter(i => i.cosmeticType === options.type);
  }
  
  if (options.rarity) {
    filtered = filtered.filter(i => i.rarity === options.rarity);
  }
  
  if (options.ownedOnly) {
    filtered = filtered.filter(i => i.isOwned);
  }
  
  if (options.sortBy === "rarity") {
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    filtered.sort((a, b) => rarityOrder[a.rarity] - rarityOrder[b.rarity]);
  } else if (options.sortBy === "price") {
    filtered.sort((a, b) => {
      const priceA = a.diamondPrice || a.goldPrice || 0;
      const priceB = b.diamondPrice || b.goldPrice || 0;
      return priceB - priceA;
    });
  } else if (options.sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  return filtered;
}

export async function purchaseCosmetic(userId: string, itemId: string) {
  return null;
}













