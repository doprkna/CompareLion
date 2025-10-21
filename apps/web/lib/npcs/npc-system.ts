/**
 * Interactive NPC System (v0.9.3)
 * 
 * PLACEHOLDER: Dynamic AI personas reacting to player choices.
 */

export interface NpcPersonality {
  npcId: string;
  name: string;
  title: string;
  avatar: string;
  archetype: "mentor" | "trickster" | "sage" | "rebel" | "guardian" | "jester";
  alignment: string;
  karmaAffinity: number; // Negative = prefers low karma, positive = prefers high karma
  archetypeMatch: string[];
  quirks: string[];
  backstory: string;
}

export const NPC_PERSONALITIES: NpcPersonality[] = [
  {
    npcId: "mentor_sage",
    name: "Athena",
    title: "The Wise Mentor",
    avatar: "🦉",
    archetype: "mentor",
    alignment: "lawful_good",
    karmaAffinity: 20, // Prefers high karma
    archetypeMatch: ["The Scholar", "The Sage", "The Polymath"],
    quirks: [
      "Speaks in thoughtful, measured tones",
      "Offers wisdom through questions",
      "Remembers your past choices",
    ],
    backstory: "An ancient scholar who guides those seeking knowledge and truth.",
  },
  {
    npcId: "trickster_loki",
    name: "Loki",
    title: "Chaos Incarnate",
    avatar: "🎭",
    archetype: "trickster",
    alignment: "chaotic_neutral",
    karmaAffinity: -10, // Slight preference for chaos
    archetypeMatch: ["The Bard", "The Artist", "Agent of Chaos"],
    quirks: [
      "Speaks in riddles and metaphors",
      "Loves unexpected challenges",
      "Tests your wit and creativity",
    ],
    backstory: "A mischievous entity who delights in unexpected twists and creative solutions.",
  },
  {
    npcId: "sage_oracle",
    name: "Oracle",
    title: "The Seer",
    avatar: "🔮",
    archetype: "sage",
    alignment: "true_neutral",
    karmaAffinity: 0, // No preference
    archetypeMatch: ["The Sage", "The Polymath", "The Balanced One"],
    quirks: [
      "Sees patterns in your choices",
      "Predicts your potential paths",
      "Speaks cryptically but truthfully",
    ],
    backstory: "A mysterious oracle who sees the threads connecting all decisions.",
  },
  {
    npcId: "rebel_spark",
    name: "Spark",
    title: "The Revolutionary",
    avatar: "⚡",
    archetype: "rebel",
    alignment: "chaotic_good",
    karmaAffinity: 10, // Prefers good intentions
    archetypeMatch: ["The Warrior", "Agent of Chaos", "The Courageous"],
    quirks: [
      "Challenges authority and norms",
      "Encourages bold action",
      "Values courage over caution",
    ],
    backstory: "A fiery spirit who inspires others to break free from limitations.",
  },
  {
    npcId: "guardian_stone",
    name: "Stone",
    title: "The Steadfast Guardian",
    avatar: "🛡️",
    archetype: "guardian",
    alignment: "lawful_neutral",
    karmaAffinity: 15, // Prefers order
    archetypeMatch: ["The Warrior", "The Diplomat", "The Balanced One"],
    quirks: [
      "Values discipline and structure",
      "Rewards consistent effort",
      "Protects those who persevere",
    ],
    backstory: "An ancient protector who tests resolve and rewards dedication.",
  },
  {
    npcId: "jester_folly",
    name: "Folly",
    title: "The Mad Jester",
    avatar: "🃏",
    archetype: "jester",
    alignment: "chaotic_chaotic",
    karmaAffinity: -20, // Loves chaos
    archetypeMatch: ["The Bard", "Agent of Chaos", "The Artist"],
    quirks: [
      "Speaks in jokes and puns",
      "Gives absurd but insightful challenges",
      "Laughs at everything (including failure)",
    ],
    backstory: "A jester who sees humor in the cosmic dance of choices and consequences.",
  },
];

/**
 * Determine which NPC should appear based on user stats
 */
export function selectNpcForUser(userStats: {
  archetype: string;
  karma: number;
  prestige: number;
  level: number;
}): NpcPersonality | null {
  const eligible = NPC_PERSONALITIES.filter(npc => {
    // Check level requirement (assume min level 1 for all)
    if (userStats.level < 1) return false;
    
    // Check archetype match
    const archetypeMatches = npc.archetypeMatch.includes(userStats.archetype);
    
    // Check karma affinity
    const karmaAligned = 
      (npc.karmaAffinity > 0 && userStats.karma > 0) ||
      (npc.karmaAffinity < 0 && userStats.karma < 0) ||
      npc.karmaAffinity === 0;
    
    return archetypeMatches || karmaAligned;
  });
  
  if (eligible.length === 0) return null;
  
  // Return random from eligible
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Generate NPC dialogue based on context
 */
export function generateNpcDialogue(
  npc: NpcPersonality,
  userStats: {
    archetype: string;
    karma: number;
    prestige: number;
  },
  interactionType: string
): string {
  console.log(`[NPC] PLACEHOLDER: Would generate ${interactionType} dialogue for ${npc.name}`);
  
  // PLACEHOLDER: Would use LLM to generate adaptive response
  // const prompt = `
  //   NPC: ${npc.name} (${npc.archetype})
  //   User: Archetype=${userStats.archetype}, Karma=${userStats.karma}
  //   Interaction: ${interactionType}
  //   Quirks: ${npc.quirks.join(', ')}
  //   Generate appropriate response.
  // `;
  
  return `[PLACEHOLDER] ${npc.name}: Greetings, traveler...`;
}

/**
 * PLACEHOLDER: Interact with NPC
 */
export async function interactWithNpc(
  userId: string,
  npcId: string,
  message?: string
) {
  console.log(`[NPC] PLACEHOLDER: Would process interaction between user ${userId} and NPC ${npcId}`);
  
  // PLACEHOLDER: Would execute
  // - Load NPC profile
  // - Load user stats
  // - Load NPC memories of this user
  // - Generate context-aware response
  // - Update interaction history
  // - Update NPC memory
  // - Return NPC response
  
  return null;
}

/**
 * PLACEHOLDER: Store NPC memory
 */
export async function storeNpcMemory(
  npcId: string,
  userId: string,
  memoryType: string,
  key: string,
  value: any,
  importance: number = 5
) {
  console.log(`[NPC] PLACEHOLDER: Would store memory for ${npcId} about user ${userId}`);
  
  // PLACEHOLDER: Would execute
  // - Upsert memory record
  // - Set importance level
  // - Set expiration based on type
  
  return null;
}











