"use client";

interface RitualStreakBarProps {
  streakCount: number;
  totalCompleted: number;
  maxStreak?: number;
}

export function RitualStreakBar({
  streakCount,
  totalCompleted,
  maxStreak = 30,
}: RitualStreakBarProps) {
  const streakPercentage = Math.min(100, (streakCount / maxStreak) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <span className="font-semibold">Streak: {streakCount} days</span>
        </div>
        <span className="text-sm text-gray-600">
          {totalCompleted} total completed
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
          style={{ width: `${streakPercentage}%` }}
        />
      </div>
      {streakCount > 0 && (
        <div className="text-xs text-gray-500 text-center">
          Keep your streak alive by completing today's ritual!
        </div>
      )}
    </div>
  );
}

