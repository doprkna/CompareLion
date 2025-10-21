/**
 * Faction & Governance (v0.10.0)
 * 
 * PLACEHOLDER: Moral/political alignment system with governance.
 */

export interface FactionDefinition {
  factionId: string;
  name: string;
  title: string;
  description: string;
  color: string;
  secondaryColor: string;
  emblem: string;
  pattern: string;
  glowEffect: string;
  moralAxis: "good" | "evil" | "neutral";
  orderAxis: "lawful" | "chaotic" | "neutral";
  philosophy: string;
  xpBonus: number;
  goldBonus: number;
  karmaMultiplier: number;
  specialAbility: string;
  lore: string;
  motto: string;
}

export const FACTIONS: FactionDefinition[] = [
  {
    factionId: "light",
    name: "Light",
    title: "The Luminous Order",
    description: "Champions of hope, truth, and righteousness",
    color: "#f59e0b",
    secondaryColor: "#fef3c7",
    emblem: "☀️",
    pattern: "radial-gradient(circle, #f59e0b, #fbbf24)",
    glowEffect: "0 0 20px rgba(245, 158, 11, 0.6)",
    moralAxis: "good",
    orderAxis: "lawful",
    philosophy: "Through order and compassion, we bring light to darkness",
    xpBonus: 0.05, // +5% XP when helping others
    goldBonus: 0.0,
    karmaMultiplier: 1.2, // 20% more karma from good actions
    specialAbility: "Radiant Shield - Reduce penalties by 25%",
    lore: "Born from the first dawn, the Luminous Order stands as a beacon of hope in times of despair.",
    motto: "Lux in Tenebris" // Light in Darkness
  },
  {
    factionId: "shadow",
    name: "Shadow",
    title: "Children of Shadow",
    description: "Masters of secrets, ambition, and forbidden knowledge",
    color: "#8b5cf6",
    secondaryColor: "#ddd6fe",
    emblem: "🌙",
    pattern: "radial-gradient(circle, #6b21a8, #8b5cf6)",
    glowEffect: "0 0 20px rgba(139, 92, 246, 0.6)",
    moralAxis: "evil",
    orderAxis: "chaotic",
    philosophy: "Power lies in the shadows; knowledge has no moral bounds",
    xpBonus: 0.0,
    goldBonus: 0.10, // +10% gold from all sources
    karmaMultiplier: 0.8, // Karma matters less
    specialAbility: "Dark Arts - Unlock forbidden flows and challenges",
    lore: "From the void between stars, the Children embrace what others fear to understand.",
    motto: "Scientia Tenebrae" // Knowledge of Shadows
  },
  {
    factionId: "balance",
    name: "Balance",
    title: "The Equilibrium",
    description: "Seekers of harmony between all forces",
    color: "#10b981",
    secondaryColor: "#d1fae5",
    emblem: "⚖️",
    pattern: "linear-gradient(135deg, #10b981, #14b8a6)",
    glowEffect: "0 0 20px rgba(16, 185, 129, 0.6)",
    moralAxis: "neutral",
    orderAxis: "neutral",
    philosophy: "All forces serve a purpose; wisdom lies in balance",
    xpBonus: 0.03,
    goldBonus: 0.03,
    karmaMultiplier: 1.0,
    specialAbility: "Perfect Harmony - Bonus when all stats balanced",
    lore: "The Equilibrium emerged when the cosmos first achieved stability, guardians of the center path.",
    motto: "In Medio Virtus" // Virtue in the Middle
  },
  {
    factionId: "chaos",
    name: "Chaos",
    title: "Agents of Entropy",
    description: "Embracers of change, creativity, and the unexpected",
    color: "#ec4899",
    secondaryColor: "#fce7f3",
    emblem: "🌀",
    pattern: "conic-gradient(#ec4899, #f472b6, #ec4899)",
    glowEffect: "0 0 20px rgba(236, 72, 153, 0.6)",
    moralAxis: "neutral",
    orderAxis: "chaotic",
    philosophy: "From chaos springs all creation; predictability is death",
    xpBonus: 0.0,
    goldBonus: 0.0,
    karmaMultiplier: 0.5, // Karma barely matters
    specialAbility: "Wild Card - Random bonus rewards (0-200% variance)",
    lore: "Born from the primordial chaos before order existed, these agents dance in unpredictability.",
    motto: "Ex Nihilo Omnia" // From Nothing, Everything
  },
];

export interface SwitchPenalty {
  type: "prestige" | "gold" | "quest";
  amount?: number;
  questId?: string;
  cooldownDays: number;
}

export const SWITCH_PENALTIES: SwitchPenalty[] = [
  {
    type: "prestige",
    amount: -10, // -10% prestige
    cooldownDays: 7,
  },
  {
    type: "gold",
    amount: 500,
    cooldownDays: 7,
  },
  {
    type: "quest",
    questId: "faction_renounce",
    cooldownDays: 14,
  },
];

/**
 * Calculate faction switch penalty based on loyalty
 */
export function calculateSwitchPenalty(loyaltyScore: number): {
  penaltyType: string;
  penaltyAmount: number;
  cooldownDays: number;
} {
  // Higher loyalty = higher penalty for leaving
  if (loyaltyScore > 75) {
    return {
      penaltyType: "prestige",
      penaltyAmount: 15, // -15% prestige
      cooldownDays: 14,
    };
  } else if (loyaltyScore > 50) {
    return {
      penaltyType: "gold",
      penaltyAmount: 500,
      cooldownDays: 7,
    };
  } else {
    return {
      penaltyType: "prestige",
      penaltyAmount: 10, // -10% prestige
      cooldownDays: 7,
    };
  }
}

/**
 * Calculate voting power based on karma/prestige
 */
export function calculateVotingPower(
  votingSystem: "equal" | "karma_based" | "prestige_based",
  userStats: { karma: number; prestige: number }
): number {
  if (votingSystem === "equal") {
    return 1;
  } else if (votingSystem === "karma_based") {
    return Math.max(1, Math.floor(userStats.karma / 10));
  } else {
    return Math.max(1, Math.floor(userStats.prestige / 10));
  }
}

/**
 * PLACEHOLDER: Join faction
 */
export async function joinFaction(userId: string, factionId: string) {
  console.log(`[Faction] PLACEHOLDER: Would add user ${userId} to faction ${factionId}`);
  
  // PLACEHOLDER: Would execute
  // - Check if user already in faction
  // - Create faction member record
  // - Apply faction bonuses
  // - Log change
  // - Notify user
  
  return null;
}

/**
 * PLACEHOLDER: Switch faction
 */
export async function switchFaction(
  userId: string,
  fromFactionId: string,
  toFactionId: string,
  penaltyChoice: "prestige" | "gold" | "quest"
) {
  console.log(`[Faction] PLACEHOLDER: Would switch user ${userId} from ${fromFactionId} to ${toFactionId}`);
  
  // PLACEHOLDER: Would execute
  // - Calculate penalty
  // - Apply penalty
  // - Update faction membership
  // - Set cooldown
  // - Log change
  // - Notify factions
  
  return null;
}

/**
 * PLACEHOLDER: Calculate faction stats
 */
export async function calculateFactionStats(factionId: string) {
  console.log(`[Faction] PLACEHOLDER: Would calculate stats for faction ${factionId}`);
  
  // PLACEHOLDER: Would execute
  // - Aggregate member XP
  // - Calculate average karma
  // - Calculate average prestige
  // - Update faction record
  
  return null;
}










