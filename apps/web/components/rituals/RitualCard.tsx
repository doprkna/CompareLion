"use client";

interface RitualCardProps {
  ritual: {
    id: string;
    key: string;
    title: string;
    description: string;
    rewardXP: number;
    rewardKarma: number;
    timeOfDay: 'morning' | 'evening' | 'any';
  };
  userProgress: {
    streakCount: number;
    totalCompleted: number;
    lastCompleted: string | null;
    completedToday: boolean;
  };
  onComplete: (ritualId: string) => Promise<void>;
  completing?: boolean;
}

export function RitualCard({
  ritual,
  userProgress,
  onComplete,
  completing,
}: RitualCardProps) {
  const timeOfDayLabels: Record<string, string> = {
    morning: '🌅 Morning',
    evening: '🌙 Evening',
    any: '🕐 Anytime',
  };

  const handleComplete = async () => {
    try {
      await onComplete(ritual.id);
    } catch (e) {
      // Error handled by hook
    }
  };

  return (
    <div className="rounded border-2 border-amber-400 p-4 mb-4 bg-gradient-to-br from-white to-amber-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🪶</span>
          <h3 className="text-lg font-semibold">Today's Ritual</h3>
          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded capitalize">
            {timeOfDayLabels[ritual.timeOfDay] || ritual.timeOfDay}
          </span>
        </div>
        {userProgress.streakCount > 0 && (
          <div className="flex items-center gap-1 text-sm font-semibold text-amber-700">
            🔥 {userProgress.streakCount} day streak
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-lg mb-2">{ritual.title}</h4>
        <p className="text-sm text-gray-700 mb-3">{ritual.description}</p>

        {/* Rewards */}
        <div className="flex gap-3 text-xs">
          <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
            +{ritual.rewardXP} XP
          </div>
          <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
            +{ritual.rewardKarma} Karma
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {userProgress.completedToday ? (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm font-semibold text-green-700 mb-1">
            ✅ Completed today!
          </div>
          <div className="text-xs text-green-600">
            Streak: {userProgress.streakCount} days • Total: {userProgress.totalCompleted}
          </div>
        </div>
      ) : (
        <button
          onClick={handleComplete}
          disabled={completing}
          className="w-full bg-amber-600 text-white py-2 px-4 rounded font-semibold hover:bg-amber-700 disabled:opacity-50 transition-all"
        >
          {completing ? 'Completing...' : 'Complete Ritual'}
        </button>
      )}

      {userProgress.totalCompleted > 0 && (
        <div className="text-xs text-gray-500 mt-2 text-center">
          Completed {userProgress.totalCompleted} time{userProgress.totalCompleted !== 1 ? 's' : ''} total
        </div>
      )}
    </div>
  );
}

