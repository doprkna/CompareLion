/**
 * Combat Runner - Skill Execution Engine
 * Handles active skill resolution in combat
 * v0.36.33 - Skills & Abilities v1
 */

import { logger } from '@/lib/logger';

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
export function runActiveSkillTurn(
  skillName: string,
  skillPower: number,
  context: SkillContext
): SkillResult {
  const { attacker, defender } = context;

  try {
    // Power Strike: 1.5x attack damage
    if (skillName === 'Power Strike') {
      const multiplier = skillPower / 100; // 150 -> 1.5
      const damage = Math.floor(attacker.attack * multiplier);
      const finalDamage = Math.max(0, Math.min(damage, defender.currentHp)); // Clamp damage

      return {
        damage: finalDamage,
        message: `⚔️ Power Strike! Dealt ${finalDamage} damage.`,
        success: true,
      };
    }

    // Shield Bash: 1.2x attack damage + 20% stun chance
    if (skillName === 'Shield Bash') {
      const multiplier = skillPower / 100; // 120 -> 1.2
      const damage = Math.floor(attacker.attack * multiplier);
      const finalDamage = Math.max(0, Math.min(damage, defender.currentHp));

      // 20% stun chance
      const stunChance = 20;
      const rolled = Math.random() * 100;
      const stunned = rolled < stunChance;

      return {
        damage: finalDamage,
        effects: stunned
          ? {
              stun: true,
              skipNextTurn: true,
            }
          : undefined,
        message: stunned
          ? `🛡️ Shield Bash! Dealt ${finalDamage} damage and stunned the enemy!`
          : `🛡️ Shield Bash! Dealt ${finalDamage} damage.`,
        success: true,
      };
    }

    // Focus Heal: Restore 10% max HP
    if (skillName === 'Focus Heal') {
      const healPercent = skillPower; // 10 = 10%
      const healAmount = Math.floor(attacker.maxHp * (healPercent / 100));
      const newHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
      const actualHeal = newHp - attacker.currentHp;

      return {
        heal: actualHeal,
        message: `💚 Focus Heal! Restored ${actualHeal} HP.`,
        success: true,
      };
    }

    // Unknown skill - fallback
    logger.warn(`[CombatRunner] Unknown skill: ${skillName}`);
    return {
      message: `Unknown skill: ${skillName}`,
      success: false,
    };
  } catch (error) {
    logger.error(`[CombatRunner] Error executing skill ${skillName}`, error);
    return {
      message: `Failed to execute ${skillName}`,
      success: false,
    };
  }
}

/**
 * Calculate passive skill bonuses
 * Returns aggregated bonuses from all passive skills
 */
export function calculatePassiveBonuses(passiveSkills: Array<{ skill: { name: string; power: number } }>) {
  const bonuses = {
    defensePercent: 0,
    critChancePercent: 0,
    speed: 0,
    lootLuckPercent: 0,
  };

  for (const userSkill of passiveSkills) {
    const skillName = userSkill.skill.name;
    const power = userSkill.skill.power;

    if (skillName === 'Tough Skin') {
      bonuses.defensePercent += power; // 5%
    } else if (skillName === 'Sharp Mind') {
      bonuses.critChancePercent += power; // 3%
    } else if (skillName === 'Quick Step') {
      bonuses.speed += power; // 3
    } else if (skillName === 'Lucky Bones') {
      bonuses.lootLuckPercent += power; // 5%
    }
  }

  return bonuses;
}

