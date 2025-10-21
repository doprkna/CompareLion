/**
 * Clan System (v0.8.13) - Totem 2.0
 * 
 * PLACEHOLDER: Large-scale social organization with shared progression.
 */

export interface ClanConfig {
  name: string;
  tag: string; // 3-5 characters
  description?: string;
  emblem: string;
  color: string;
  isPublic: boolean;
  requireApproval: boolean;
  minLevel: number;
  maxMembers: number;
}

export interface ClanUpgradeDefinition {
  upgradeType: string;
  name: string;
  description: string;
  maxLevel: number;
  costPerLevel: number[];
  effects: {
    level1: { boost: number };
    level2: { boost: number };
    level3: { boost: number };
    level4?: { boost: number };
    level5?: { boost: number };
  };
}

export const CLAN_UPGRADES: ClanUpgradeDefinition[] = [
  {
    upgradeType: "xp_boost",
    name: "XP Amplifier",
    description: "Increase XP gains for all clan members",
    maxLevel: 5,
    costPerLevel: [1000, 2500, 5000, 10000, 20000],
    effects: {
      level1: { boost: 1.05 }, // +5%
      level2: { boost: 1.10 }, // +10%
      level3: { boost: 1.15 }, // +15%
      level4: { boost: 1.20 }, // +20%
      level5: { boost: 1.25 }, // +25%
    },
  },
  {
    upgradeType: "gold_boost",
    name: "Golden Treasury",
    description: "Increase gold gains for all clan members",
    maxLevel: 5,
    costPerLevel: [800, 2000, 4000, 8000, 16000],
    effects: {
      level1: { boost: 1.05 },
      level2: { boost: 1.10 },
      level3: { boost: 1.15 },
      level4: { boost: 1.20 },
      level5: { boost: 1.25 },
    },
  },
  {
    upgradeType: "member_slots",
    name: "Hall Expansion",
    description: "Increase maximum clan member capacity",
    maxLevel: 3,
    costPerLevel: [5000, 15000, 30000],
    effects: {
      level1: { boost: 60 },  // +10 slots (50 -> 60)
      level2: { boost: 75 },  // +15 more (60 -> 75)
      level3: { boost: 100 }, // +25 more (75 -> 100)
    },
  },
  {
    upgradeType: "cosmetic_banner",
    name: "Legendary Banner",
    description: "Unlock exclusive clan banner",
    maxLevel: 1,
    costPerLevel: [10000],
    effects: {
      level1: { boost: 1 }, // Cosmetic only
    },
  },
];

export const CLAN_EMBLEMS = [
  "🏰", "⚔️", "🛡️", "🦁", "🐉", "🦅", "🐺", "🔥",
  "⚡", "🌙", "☀️", "💎", "👑", "🎯", "🌟", "💀",
];

export const CLAN_COLORS = [
  "#8b5cf6", // Purple
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#64748b", // Slate
];

/**
 * Calculate clan level based on total XP
 */
export function calculateClanLevel(totalXp: number): number {
  // Similar to user level formula
  return Math.floor(Math.sqrt(totalXp / 1000)) + 1;
}

/**
 * Calculate XP needed for next clan level
 */
export function nextClanLevelXp(currentLevel: number): number {
  return (currentLevel ** 2) * 1000;
}

/**
 * Calculate weekly reward chest tier
 */
export function calculateRewardChestTier(weeklyXp: number): {
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  rewards: {
    gold: number;
    diamonds?: number;
  };
} {
  if (weeklyXp >= 100000) {
    return {
      tier: "diamond",
      rewards: { gold: 5000, diamonds: 100 },
    };
  } else if (weeklyXp >= 50000) {
    return {
      tier: "platinum",
      rewards: { gold: 3000, diamonds: 50 },
    };
  } else if (weeklyXp >= 25000) {
    return {
      tier: "gold",
      rewards: { gold: 2000, diamonds: 25 },
    };
  } else if (weeklyXp >= 10000) {
    return {
      tier: "silver",
      rewards: { gold: 1000 },
    };
  } else {
    return {
      tier: "bronze",
      rewards: { gold: 500 },
    };
  }
}

/**
 * PLACEHOLDER: Create clan
 */
export async function createClan(leaderId: string, config: ClanConfig) {
  console.log("[Clan] PLACEHOLDER: Would create clan", config.name);
  
  // PLACEHOLDER: Would validate and create
  // - Check if user already in clan
  // - Validate tag uniqueness
  // - Create clan with leader role
  
  return null;
}

/**
 * PLACEHOLDER: Weekly XP reset and reward distribution
 */
export async function weeklyReset() {
  console.log("[Clan] PLACEHOLDER: Would run weekly reset");
  
  // PLACEHOLDER: Would execute
  // 1. Calculate reward chests for all clans based on weeklyXp
  // 2. Distribute rewards to all members
  // 3. Reset weeklyXp to 0
  // 4. Log activity
  
  return [];
}

/**
 * PLACEHOLDER: Add XP to clan
 */
export async function addClanXp(
  clanId: string,
  userId: string,
  xpAmount: number
) {
  console.log(`[Clan] PLACEHOLDER: Would add ${xpAmount} XP to clan ${clanId} from user ${userId}`);
  
  // PLACEHOLDER: Would execute
  // - Add to clan totalXp and weeklyXp
  // - Add to member xpContributed and weeklyXpContributed
  // - Check for level up
  // - Log activity if milestone reached
  
  return null;
}

/**
 * PLACEHOLDER: Purchase clan upgrade
 */
export async function purchaseUpgrade(
  clanId: string,
  upgradeType: string,
  level: number
) {
  console.log(`[Clan] PLACEHOLDER: Would purchase ${upgradeType} level ${level} for clan ${clanId}`);
  
  return null;
}











