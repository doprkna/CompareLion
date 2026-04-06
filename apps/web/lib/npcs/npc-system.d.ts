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
    karmaAffinity: number;
    archetypeMatch: string[];
    quirks: string[];
    backstory: string;
}
export declare const NPC_PERSONALITIES: NpcPersonality[];
/**
 * Determine which NPC should appear based on user stats
 */
export declare function selectNpcForUser(userStats: {
    archetype: string;
    karma: number;
    prestige: number;
    level: number;
}): NpcPersonality | null;
/**
 * Generate NPC dialogue based on context
 */
export declare function generateNpcDialogue(npc: NpcPersonality, userStats: {
    archetype: string;
    karma: number;
    prestige: number;
}, interactionType: string): string;
/**
 * PLACEHOLDER: Interact with NPC
 */
export declare function interactWithNpc(userId: string, npcId: string, message?: string): Promise<null>;
/**
 * PLACEHOLDER: Store NPC memory
 */
export declare function storeNpcMemory(npcId: string, userId: string, memoryType: string, key: string, value: any, importance?: number): Promise<null>;
