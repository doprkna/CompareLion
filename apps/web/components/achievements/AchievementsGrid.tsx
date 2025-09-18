import AchievementBadge from './AchievementBadge';
import type { Achievement } from '@/types/achievement';

export default function AchievementsGrid({
  achievements,
  earnedIds = new Set<string>(),
}: {
  achievements: Achievement[];
  earnedIds?: Set<string>;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {achievements.map((a) => (
        <AchievementBadge key={a.id} a={a} locked={!earnedIds.has(a.id)} />
      ))}
    </div>
  );
}
