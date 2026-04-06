/**
 * Adventure Engine
 * Linear progression system with nodes
 * v0.36.16 - Adventure Mode v0.1
 */
export interface AdventureNodeDTO {
    id: string;
    stage: number;
    type: 'fight' | 'reward' | 'shop' | 'event';
    data: any;
}
export interface AdventureState {
    runId: string;
    currentStage: number;
    currentNode: AdventureNodeDTO | null;
    isFinished: boolean;
    totalStages: number;
}
/**
 * Get current node for user's active adventure run
 */
export declare function getCurrentNode(userId: string): Promise<AdventureState | null>;
/**
 * Start a new adventure run
 * Creates new run at stage 1 if no active run exists
 */
export declare function startAdventure(userId: string): Promise<AdventureState>;
/**
 * Advance to next stage
 * Increments stage, marks as finished if past max
 */
export declare function advanceAdventure(userId: string): Promise<AdventureState | null>;
/**
 * Reset adventure run
 * Deactivates current run and creates new one
 */
export declare function resetAdventure(userId: string): Promise<AdventureState>;
/**
 * Get all nodes for display (map view)
 */
export declare function getAllNodes(): Promise<AdventureNodeDTO[]>;
