/**
 * World Restart & Legacy System (v0.10.2)
 * 
 * PLACEHOLDER: Seasonal restarts with persistent legacy bonuses.
 */

export interface AscensionChoice {
  choice: "ascend" | "descend" | "neutral";
  name: string;
  description: string;
  bonuses: string[];
  penalties: string[];
}

export const ASCENSION_CHOICES: AscensionChoice[] = [
  {
    choice: "ascend",
    name: "Ascendance",
    description: "Carry forward your power and knowledge",
    bonuses: [
      "Keep 20% of prestige",
      "Earn legacy title",
      "Permanent artifact unlock",
      "Mentor NPC remembers you",
    ],
    penalties: [
      "Start at level 1 with reduced XP gain initially",
      "No mutation bonuses",
    ],
  },
  {
    choice: "descend",
    name: "Descendance",
    description: "Embrace rebirth with new possibilities",
    bonuses: [
      "+25% XP gain for first 10 levels",
      "Random mutation (new trait/ability)",
      "Unlock hidden archetype path",
      "Fresh start bonus rewards",
    ],
    penalties: [
      "Lose all prestige",
      "No titles carried over",
    ],
  },
  {
    choice: "neutral",
    name: "Neutral Reset",
    description: "Clean slate with balanced approach",
    bonuses: [
      "Keep 10% prestige",
      "+10% XP gain",
      "Choose one artifact to keep",
    ],
    penalties: [
      "No special bonuses or mutations",
    ],
  },
];

export interface Mutation {
  mutationId: string;
  name: string;
  description: string;
  effect: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const MUTATIONS: Mutation[] = [
  {
    mutationId: "double_xp_knowledge",
    name: "Scholar's Mind",
    description: "Double XP from knowledge activities",
    effect: "knowledge_xp_2x",
    rarity: "rare",
  },
  {
    mutationId: "chaos_affinity",
    name: "Chaos Touched",
    description: "Chaos actions have 50% more impact",
    effect: "chaos_impact_1.5x",
    rarity: "epic",
  },
  {
    mutationId: "golden_touch",
    name: "Midas' Blessing",
    description: "+30% gold from all sources",
    effect: "gold_bonus_0.3",
    rarity: "legendary",
  },
  {
    mutationId: "swift_learner",
    name: "Prodigy",
    description: "Reach max level 50% faster",
    effect: "xp_curve_0.5",
    rarity: "epic",
  },
  {
    mutationId: "social_butterfly",
    name: "Charismatic Aura",
    description: "Harmony gains doubled",
    effect: "harmony_2x",
    rarity: "common",
  },
];

export interface LegacyArtifact {
  artifactId: string;
  name: string;
  type: "cosmetic" | "aura" | "theme" | "title";
  description: string;
  requirement: string;
}

export const LEGACY_ARTIFACTS: LegacyArtifact[] = [
  {
    artifactId: "eternal_flame",
    name: "Eternal Flame Aura",
    type: "aura",
    description: "Burning aura from surviving an Age of Darkness",
    requirement: "Survive complete Age of Darkness event",
  },
  {
    artifactId: "cosmic_crown",
    name: "Cosmic Crown",
    type: "cosmetic",
    description: "Crown earned by achieving Perfect Harmony",
    requirement: "Trigger Cosmic Harmony event",
  },
  {
    artifactId: "void_walker_theme",
    name: "Void Walker Theme",
    type: "theme",
    description: "Theme from conquering the Abyss Layer 50",
    requirement: "Reach Abyss Layer 50",
  },
  {
    artifactId: "timeless_sage",
    name: "Timeless Sage",
    type: "title",
    description: "Title for completing 3+ cycles as Ascendant",
    requirement: "Ascend 3 times",
  },
];

/**
 * Calculate legacy bonuses for ascension
 */
export function calculateAscensionBonus(
  prestige: number,
  titles: string[],
  achievements: string[]
): {
  prestigeCarry: number;
  legacyTitles: string[];
  artifacts: string[];
} {
  const prestigeCarry = Math.floor(prestige * 0.20); // 20% of prestige
  
  // Select one title to carry as "legacy"
  const legacyTitles = titles.length > 0 ? [titles[0]] : [];
  
  // Determine artifacts based on achievements
  const artifacts: string[] = [];
  if (achievements.includes("cosmic_one")) {
    artifacts.push("cosmic_crown");
  }
  if (achievements.includes("lightbringer")) {
    artifacts.push("eternal_flame");
  }
  
  return { prestigeCarry, legacyTitles, artifacts };
}

/**
 * Generate random mutation for descendance
 */
export function generateRandomMutation(): Mutation {
  // Weight by rarity
  const pool: Mutation[] = [];
  MUTATIONS.forEach(m => {
    const weight = {
      common: 10,
      rare: 5,
      epic: 2,
      legendary: 1,
    }[m.rarity];
    
    for (let i = 0; i < weight; i++) {
      pool.push(m);
    }
  });
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * PLACEHOLDER: Archive current cycle
 */
export async function archiveCycle(cycleNumber: number) {
  console.log(`[Legacy] PLACEHOLDER: Would archive cycle ${cycleNumber}`);
  
  // PLACEHOLDER: Would execute
  // - Snapshot all user stats
  // - Calculate rankings
  // - Create legacy records
  // - Mark cycle as completed
  
  return null;
}

/**
 * PLACEHOLDER: Start new cycle
 */
export async function startNewCycle(cycleName: string, duration: number) {
  console.log(`[Legacy] PLACEHOLDER: Would start new cycle: ${cycleName}`);
  
  // PLACEHOLDER: Would execute
  // - Create new WorldCycle
  // - Reset world state
  // - Apply legacy bonuses to users
  // - Unlock new content
  // - Post announcement
  
  return null;
}

/**
 * PLACEHOLDER: Process ascension choice
 */
export async function processAscension(
  userId: string,
  choice: "ascend" | "descend" | "neutral"
) {
  console.log(`[Legacy] PLACEHOLDER: Would process ${choice} for user ${userId}`);
  
  // PLACEHOLDER: Would execute
  // - Load user stats
  // - Calculate bonuses based on choice
  // - Create legacy bonus records
  // - Reset user progress
  // - Apply bonuses
  
  return null;
}











