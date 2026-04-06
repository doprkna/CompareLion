/**
 * Mission Service - Daily & Weekly Missions
 * v0.36.28 - BattlePass 2.0
 */
export interface DailyMission {
    id: string;
    type: 'answer_question' | 'win_fight' | 'login';
    description: string;
    xpReward: number;
    progress: number;
    target: number;
    completed: boolean;
}
export interface WeeklyMission {
    id: string;
    type: 'answer_questions' | 'win_fights' | 'earn_gold' | 'get_loot';
    description: string;
    xpReward: number;
    progress: number;
    target: number;
    completed: boolean;
}
/**
 * Get daily missions for user
 */
export declare function getDailyMissions(userId: string): Promise<DailyMission[]>;
/**
 * Get weekly missions for user
 */
export declare function getWeeklyMissions(userId: string): Promise<WeeklyMission[]>;
/**
 * Update mission progress
 */
export declare function updateMissionProgress(userId: string, missionType: string, amount?: number): Promise<void>;
