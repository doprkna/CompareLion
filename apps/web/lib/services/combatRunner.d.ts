/**
 * Combat Runner - Skill Execution Engine
 * Handles active skill resolution in combat
 * v0.36.33 - Skills & Abilities v1
 */
export interface CombatActor {
    id: string;
    attack: number;
    defense: number;
    maxHp: number;
    currentHp: number;
    critChance?: number;
    speed?: number;
}
export interface SkillContext {
    round: number;
    attacker: CombatActor;
    defender: CombatActor;
    isPlayerTurn: boolean;
}
export interface SkillResult {
    damage?: number;
    heal?: number;
    effects?: {
        stun?: boolean;
        skipNextTurn?: boolean;
    };
    message: string;
    success: boolean;
}
/**
 * Run active skill turn
 * Resolves skill effects based on skill name and power
 */
export declare function runActiveSkillTurn(skillName: string, skillPower: number, context: SkillContext): SkillResult;
/**
 * Calculate passive skill bonuses
 * Returns aggregated bonuses from all passive skills
 */
export declare function calculatePassiveBonuses(passiveSkills: Array<{
    skill: {
        name: string;
        power: number;
    };
}>): {
    defensePercent: number;
    critChancePercent: number;
    speed: number;
    lootLuckPercent: number;
};
