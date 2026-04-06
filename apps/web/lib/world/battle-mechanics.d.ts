/**
 * World Threat Battle Mechanics (v0.10.1)
 *
 * PLACEHOLDER: Interactive battles against AI-generated threats.
 */
export interface ThreatDefinition {
    threatId: string;
    name: string;
    title: string;
    description: string;
    avatar: string;
    type: "monster" | "anomaly" | "crisis" | "corruption";
    difficulty: "minor" | "moderate" | "major" | "catastrophic";
    maxHealth: number;
    defense: number;
    threatLevel: number;
    xpReward: number;
    goldReward: number;
    specialReward?: any;
    lore: string;
}
export declare const THREAT_TEMPLATES: ThreatDefinition[];
/**
 * Calculate damage dealt to threat
 */
export declare function calculateDamage(attackerLevel: number, attackerPrestige: number, threatDefense: number, attackType: "solo" | "faction" | "cooperative"): {
    damage: number;
    isCritical: boolean;
    randomFactor: number;
};
/**
 * Determine threat spawn based on world state
 */
export declare function shouldSpawnThreat(worldState: {
    hope: number;
    chaos: number;
    knowledge: number;
    harmony: number;
    creativity: number;
}): {
    spawn: boolean;
    threatType?: string;
    reason?: string;
};
/**
 * Calculate territory control bonus
 */
export declare function calculateTerritoryBonus(controlStrength: number, resourceType: string): {
    xpBonus: number;
    goldBonus: number;
};
/**
 * PLACEHOLDER: Attack threat
 */
export declare function attackThreat(userId: string, threatId: string, attackType: "solo" | "faction" | "cooperative"): Promise<null>;
/**
 * PLACEHOLDER: Generate AI threat
 */
export declare function generateAIThreat(worldState: any): Promise<null>;
