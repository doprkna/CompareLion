import type { Achievement as StaticAchievement } from '@/types/achievement';
export declare function toAchievementDTO(a: StaticAchievement): {
    id: string;
    code: string;
    label: string;
    description: string;
    earnedAt: Date | null;
};
export type AchievementDTO = ReturnType<typeof toAchievementDTO>;
