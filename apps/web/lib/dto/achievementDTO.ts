import type { Achievement as PrismaAchievement } from '@parel/db/src/client';

export function toAchievementDTO(a: PrismaAchievement): {
  id: string;
  code: string;
  label: string;
  description: string | null;
  earnedAt: Date | null;
} {
  return {
    id: a.id,
    code: a.code,
    label: a.label,
    description: a.description ?? null,
    earnedAt: a.earnedAt ?? null,
  };
}

export type AchievementDTO = ReturnType<typeof toAchievementDTO>;
