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
export declare const FACTIONS: FactionDefinition[];
export interface SwitchPenalty {
    type: "prestige" | "gold" | "quest";
    amount?: number;
    questId?: string;
    cooldownDays: number;
}
export declare const SWITCH_PENALTIES: SwitchPenalty[];
/**
 * Calculate faction switch penalty based on loyalty
 */
export declare function calculateSwitchPenalty(loyaltyScore: number): {
    penaltyType: string;
    penaltyAmount: number;
    cooldownDays: number;
};
/**
 * Calculate voting power based on karma/prestige
 */
export declare function calculateVotingPower(votingSystem: "equal" | "karma_based" | "prestige_based", userStats: {
    karma: number;
    prestige: number;
}): number;
/**
 * PLACEHOLDER: Join faction
 */
export declare function joinFaction(_userId: string, _factionId: string): Promise<null>;
/**
 * PLACEHOLDER: Switch faction
 */
export declare function switchFaction(_userId: string, _fromFactionId: string, _toFactionId: string, _penaltyChoice: "prestige" | "gold" | "quest"): Promise<null>;
/**
 * PLACEHOLDER: Calculate faction stats
 */
export declare function calculateFactionStats(_factionId: string): Promise<null>;
