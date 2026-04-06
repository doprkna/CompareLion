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
export declare const ASCENSION_CHOICES: AscensionChoice[];
export interface Mutation {
    mutationId: string;
    name: string;
    description: string;
    effect: string;
    rarity: "common" | "rare" | "epic" | "legendary";
}
export declare const MUTATIONS: Mutation[];
export interface LegacyArtifact {
    artifactId: string;
    name: string;
    type: "cosmetic" | "aura" | "theme" | "title";
    description: string;
    requirement: string;
}
export declare const LEGACY_ARTIFACTS: LegacyArtifact[];
/**
 * Calculate legacy bonuses for ascension
 */
export declare function calculateAscensionBonus(prestige: number, titles: string[], achievements: string[]): {
    prestigeCarry: number;
    legacyTitles: string[];
    artifacts: string[];
};
/**
 * Generate random mutation for descendance
 */
export declare function generateRandomMutation(): Mutation;
/**
 * PLACEHOLDER: Archive current cycle
 */
export declare function archiveCycle(cycleNumber: number): Promise<null>;
/**
 * PLACEHOLDER: Start new cycle
 */
export declare function startNewCycle(cycleName: string, duration: number): Promise<null>;
/**
 * PLACEHOLDER: Process ascension choice
 */
export declare function processAscension(userId: string, choice: "ascend" | "descend" | "neutral"): Promise<null>;
