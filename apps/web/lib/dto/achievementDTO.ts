import type { Achievement as StaticAchievement } from '@/types/achievement';

export function toAchievementDTO(a: StaticAchievement): {
  id: string;
  code: string;
  label: string;
  description: string;
  earnedAt: Date | null;
} {
  return {
    id: a.id,
    code: a.id,
    label: a.title,
    description: a.description,
    earnedAt: null,
  };
}

export type AchievementDTO = ReturnType<typeof toAchievementDTO>;
