/**
 * Persistent World Simulation (v0.9.4)
 * 
 * PLACEHOLDER: Evolving world state influenced by collective user actions.
 */

export interface WorldVariables {
  hope: number;        // 0-100
  chaos: number;       // 0-100
  creativity: number;  // 0-100
  knowledge: number;   // 0-100
  harmony: number;     // 0-100
}

export interface WorldAlignment {
  alignment: "hopeful" | "chaotic" | "creative" | "ordered" | "balanced" | "dark";
  dominantForce: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * Calculate world alignment based on variables
 */
export function calculateWorldAlignment(vars: WorldVariables): WorldAlignment {
  const { hope, chaos, creativity, knowledge, harmony } = vars;
  
  // Find dominant force
  const max = Math.max(hope, chaos, creativity, knowledge, harmony);
  
  if (max === hope && hope > 60) {
    return {
      alignment: "hopeful",
      dominantForce: "Hope",
      description: "The world is filled with optimism and light",
      icon: "☀️",
      color: "#f59e0b",
    };
  } else if (max === chaos && chaos > 60) {
    return {
      alignment: "chaotic",
      dominantForce: "Chaos",
      description: "Unpredictability reigns supreme",
      icon: "🌀",
      color: "#ec4899",
    };
  } else if (max === creativity && creativity > 60) {
    return {
      alignment: "creative",
      dominantForce: "Creativity",
      description: "Innovation and imagination flourish",
      icon: "🎨",
      color: "#8b5cf6",
    };
  } else if (max === knowledge && knowledge > 60) {
    return {
      alignment: "ordered",
      dominantForce: "Knowledge",
      description: "Wisdom and order prevail",
      icon: "📚",
      color: "#3b82f6",
    };
  } else if (harmony > 60) {
    return {
      alignment: "balanced",
      dominantForce: "Harmony",
      description: "Perfect balance achieved",
      icon: "⚖️",
      color: "#10b981",
    };
  } else if (hope < 30 && harmony < 30) {
    return {
      alignment: "dark",
      dominantForce: "Despair",
      description: "Darkness spreads across the land",
      icon: "🌑",
      color: "#64748b",
    };
  } else {
    return {
      alignment: "balanced",
      dominantForce: "Balance",
      description: "The world is in equilibrium",
      icon: "⚖️",
      color: "#10b981",
    };
  }
}

/**
 * Calculate contribution to world variables from user action
 */
export function calculateActionContribution(
  actionType: "answer" | "challenge" | "flow" | "social",
  actionData: {
    sentiment?: string;
    category?: string;
    outcome?: string;
  }
): Partial<WorldVariables> {
  const contribution: Partial<WorldVariables> = {};
  
  if (actionType === "answer") {
    // Answers contribute to knowledge
    contribution.knowledge = 0.1;
    
    if (actionData.sentiment === "positive") {
      contribution.hope = 0.05;
    } else if (actionData.sentiment === "negative") {
      contribution.chaos = 0.05;
    }
  } else if (actionType === "challenge") {
    // Challenges contribute to chaos or hope
    if (actionData.outcome === "accepted") {
      contribution.chaos = 0.2;
      contribution.hope = 0.1;
    }
  } else if (actionType === "flow") {
    // Flows contribute to creativity and knowledge
    contribution.creativity = 0.15;
    contribution.knowledge = 0.1;
  } else if (actionType === "social") {
    // Social actions contribute to harmony
    contribution.harmony = 0.2;
    contribution.hope = 0.05;
  }
  
  return contribution;
}

/**
 * Check for event triggers based on world state
 */
export function checkEventTriggers(vars: WorldVariables): {
  triggered: boolean;
  eventType?: string;
  description?: string;
} {
  // Chaos threshold
  if (vars.chaos > 70) {
    return {
      triggered: true,
      eventType: "chaos_surge",
      description: "Chaos has consumed the world! A great challenge appears...",
    };
  }
  
  // Hope threshold
  if (vars.hope > 80) {
    return {
      triggered: true,
      eventType: "age_of_light",
      description: "Hope shines bright! A golden age begins...",
    };
  }
  
  // Knowledge threshold
  if (vars.knowledge > 75) {
    return {
      triggered: true,
      eventType: "enlightenment",
      description: "Collective wisdom reaches new heights!",
    };
  }
  
  // Perfect balance
  if (
    Math.abs(vars.hope - vars.chaos) < 5 &&
    Math.abs(vars.creativity - vars.knowledge) < 5 &&
    Math.abs(vars.harmony - 50) < 5
  ) {
    return {
      triggered: true,
      eventType: "perfect_balance",
      description: "Perfect harmony achieved! A rare cosmic event unfolds...",
    };
  }
  
  // Despair (low hope + low harmony)
  if (vars.hope < 20 && vars.harmony < 20) {
    return {
      triggered: true,
      eventType: "age_of_darkness",
      description: "Darkness spreads... Can heroes restore hope?",
    };
  }
  
  return { triggered: false };
}

/**
 * PLACEHOLDER: Recalculate world state (daily cron)
 */
export async function recalculateWorldState() {
  console.log("[WorldSim] PLACEHOLDER: Would recalculate world state");
  
  // PLACEHOLDER: Would execute
  // - Aggregate all user contributions from past 24h
  // - Calculate new values for each variable
  // - Determine alignment
  // - Check for event triggers
  // - Create new WorldState record
  // - Trigger events if thresholds met
  // - Post lore updates to feed
  
  return null;
}

/**
 * PLACEHOLDER: Record user contribution
 */
export async function recordWorldContribution(
  userId: string,
  actionType: "answer" | "challenge" | "flow" | "social",
  actionData: any
) {
  console.log(`[WorldSim] PLACEHOLDER: Would record contribution from user ${userId}`);
  
  // PLACEHOLDER: Would execute
  // - Calculate contribution values
  // - Upsert user's daily contribution record
  // - Update running totals
  
  return null;
}











