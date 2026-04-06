/**
 * Mission Registry
 * Mission templates and assignment rules
 * v0.36.36 - Missions & Quests 1.0
 */
import { MissionType, Mission } from './types';
/**
 * Default daily mission templates
 * These will be used to create Mission records in the database
 */
export declare const DEFAULT_DAILY_MISSIONS: Omit<Mission, 'id'>[];
/**
 * Default weekly mission templates
 */
export declare const DEFAULT_WEEKLY_MISSIONS: Omit<Mission, 'id'>[];
/**
 * Get mission templates by type
 */
export declare function getMissionTemplates(type: MissionType): Omit<Mission, 'id'>[];
/**
 * Validate mission template
 */
export declare function validateMissionTemplate(mission: Omit<Mission, 'id'>): boolean;
