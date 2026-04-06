/**
 * Weekly Modifiers System
 * v0.34.2 - Manages rotating weekly economy modifiers
 */
export interface WeeklyModifier {
    id: string;
    name: string;
    description: string;
    bonusType: 'xp' | 'gold' | 'social' | 'streak';
    bonusValue: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}
export declare const WEEKLY_MODIFIER_PRESETS: Omit<WeeklyModifier, 'id' | 'startDate' | 'endDate' | 'isActive'>[];
/**
 * Get the current active weekly modifier
 */
export declare function getCurrentWeeklyModifier(): Promise<WeeklyModifier | null>;
/**
 * Set the active weekly modifier
 */
export declare function setWeeklyModifier(presetIndex: number, bonusValue?: number): Promise<void>;
/**
 * Clear the active weekly modifier
 */
export declare function clearWeeklyModifier(): Promise<void>;
/**
 * Get time remaining until next weekly reset
 */
export declare function getTimeUntilReset(): {
    days: number;
    hours: number;
    minutes: number;
};
