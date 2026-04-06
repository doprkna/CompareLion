/**
 * Persistent World Simulation (v0.9.4)
 *
 * PLACEHOLDER: Evolving world state influenced by collective user actions.
 */
export interface WorldVariables {
    hope: number;
    chaos: number;
    creativity: number;
    knowledge: number;
    harmony: number;
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
export declare function calculateWorldAlignment(vars: WorldVariables): WorldAlignment;
/**
 * Calculate contribution to world variables from user action
 */
export declare function calculateActionContribution(actionType: "answer" | "challenge" | "flow" | "social", actionData: {
    sentiment?: string;
    category?: string;
    outcome?: string;
}): Partial<WorldVariables>;
/**
 * Check for event triggers based on world state
 */
export declare function checkEventTriggers(vars: WorldVariables): {
    triggered: boolean;
    eventType?: string;
    description?: string;
};
/**
 * PLACEHOLDER: Recalculate world state (daily cron)
 */
export declare function recalculateWorldState(): Promise<null>;
/**
 * PLACEHOLDER: Record user contribution
 */
export declare function recordWorldContribution(userId: string, actionType: "answer" | "challenge" | "flow" | "social", actionData: any): Promise<null>;
