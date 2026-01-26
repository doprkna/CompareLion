export interface StreakData {
    currentStreak: number;
    lastActivityDate?: string;
    longestStreak?: number;
}
export declare function getStreakData(): StreakData | null;
export declare function updateStreak(): {
    streak: StreakData;
    isNewStreak: boolean;
    wasBroken: boolean;
};
export declare function getStreakMessage(currentStreak: number, isNewStreak: boolean, wasBroken: boolean): string;
