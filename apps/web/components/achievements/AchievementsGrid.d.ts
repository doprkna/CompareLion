import type { Achievement } from '@/types/achievement';
export default function AchievementsGrid({ achievements, earnedIds, }: {
    achievements: Achievement[];
    earnedIds?: Set<string>;
}): import("react").JSX.Element;
