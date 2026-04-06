/**
 * Clan System (v0.8.13) - Totem 2.0
 *
 * PLACEHOLDER: Large-scale social organization with shared progression.
 */
export interface ClanConfig {
    name: string;
    tag: string;
    description?: string;
    emblem: string;
    color: string;
    isPublic: boolean;
    requireApproval: boolean;
    minLevel: number;
    maxMembers: number;
}
export interface ClanUpgradeDefinition {
    upgradeType: string;
    name: string;
    description: string;
    maxLevel: number;
    costPerLevel: number[];
    effects: {
        level1: {
            boost: number;
        };
        level2: {
            boost: number;
        };
        level3: {
            boost: number;
        };
        level4?: {
            boost: number;
        };
        level5?: {
            boost: number;
        };
    };
}
export declare const CLAN_UPGRADES: ClanUpgradeDefinition[];
export declare const CLAN_EMBLEMS: string[];
export declare const CLAN_COLORS: string[];
/**
 * Calculate clan level based on total XP
 */
export declare function calculateClanLevel(totalXp: number): number;
/**
 * Calculate XP needed for next clan level
 */
export declare function nextClanLevelXp(currentLevel: number): number;
/**
 * Calculate weekly reward chest tier
 */
export declare function calculateRewardChestTier(weeklyXp: number): {
    tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
    rewards: {
        gold: number;
        diamonds?: number;
    };
};
/**
 * PLACEHOLDER: Create clan
 */
export declare function createClan(leaderId: string, config: ClanConfig): Promise<null>;
/**
 * PLACEHOLDER: Weekly XP reset and reward distribution
 */
export declare function weeklyReset(): Promise<never[]>;
/**
 * PLACEHOLDER: Add XP to clan
 */
export declare function addClanXp(clanId: string, userId: string, xpAmount: number): Promise<null>;
/**
 * PLACEHOLDER: Purchase clan upgrade
 */
export declare function purchaseUpgrade(clanId: string, upgradeType: string, level: number): Promise<null>;
