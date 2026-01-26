/**
 * Mission Registry
 * Mission templates and assignment rules
 * v0.36.36 - Missions & Quests 1.0
 */

import {
  MissionType,
  ObjectiveType,
  Mission,
  MissionReward,
} from './types';

/**
 * Default daily mission templates
 * These will be used to create Mission records in the database
 */
export const DEFAULT_DAILY_MISSIONS: Omit<Mission, 'id'>[] = [
  {
    type: MissionType.DAILY,
    objectiveType: ObjectiveType.ANSWER_QUESTIONS,
    targetValue: 5,
    title: 'Daily Questions',
    description: 'Answer 5 questions today',
    reward: {
      xp: 50,
      gold: 25,
      battlepassXP: 10,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 1,
    category: 'engagement',
  },
  {
    type: MissionType.DAILY,
    objectiveType: ObjectiveType.WIN_FIGHTS,
    targetValue: 3,
    title: 'Combat Daily',
    description: 'Win 3 fights today',
    reward: {
      xp: 75,
      gold: 50,
      battlepassXP: 15,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 2,
    category: 'combat',
  },
  {
    type: MissionType.DAILY,
    objectiveType: ObjectiveType.LOGIN,
    targetValue: 1,
    title: 'Daily Login',
    description: 'Login today',
    reward: {
      xp: 25,
      gold: 10,
      battlepassXP: 5,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 0,
    category: 'login',
  },
];

/**
 * Default weekly mission templates
 */
export const DEFAULT_WEEKLY_MISSIONS: Omit<Mission, 'id'>[] = [
  {
    type: MissionType.WEEKLY,
    objectiveType: ObjectiveType.ANSWER_QUESTIONS,
    targetValue: 50,
    title: 'Weekly Scholar',
    description: 'Answer 50 questions this week',
    reward: {
      xp: 500,
      gold: 250,
      battlepassXP: 100,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 1,
    category: 'engagement',
  },
  {
    type: MissionType.WEEKLY,
    objectiveType: ObjectiveType.WIN_FIGHTS,
    targetValue: 20,
    title: 'Weekly Warrior',
    description: 'Win 20 fights this week',
    reward: {
      xp: 750,
      gold: 500,
      battlepassXP: 150,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 2,
    category: 'combat',
  },
  {
    type: MissionType.WEEKLY,
    objectiveType: ObjectiveType.EARN_GOLD,
    targetValue: 1000,
    title: 'Weekly Gold Rush',
    description: 'Earn 1000 gold this week',
    reward: {
      xp: 400,
      gold: 200,
      battlepassXP: 75,
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 3,
    category: 'economy',
  },
  {
    type: MissionType.WEEKLY,
    objectiveType: ObjectiveType.KILL_ENEMIES,
    targetValue: 30,
    title: 'Weekly Slayer',
    description: 'Kill 30 enemies this week',
    reward: {
      xp: 600,
      gold: 300,
      battlepassXP: 120,
      items: [
        { itemId: 'health_potion', quantity: 3 },
      ],
    },
    isActive: true,
    isRepeatable: true,
    sortOrder: 4,
    category: 'combat',
  },
];

/**
 * Get mission templates by type
 */
export function getMissionTemplates(type: MissionType): Omit<Mission, 'id'>[] {
  switch (type) {
    case MissionType.DAILY:
      return DEFAULT_DAILY_MISSIONS;
    case MissionType.WEEKLY:
      return DEFAULT_WEEKLY_MISSIONS;
    case MissionType.QUEST:
      return []; // Quest templates handled separately
    default:
      return [];
  }
}

/**
 * Validate mission template
 */
export function validateMissionTemplate(mission: Omit<Mission, 'id'>): boolean {
  if (!mission.title || mission.title.length === 0) return false;
  if (!mission.description || mission.description.length === 0) return false;
  if (mission.targetValue <= 0) return false;
  if (!mission.reward || Object.keys(mission.reward).length === 0) return false;
  return true;
}

