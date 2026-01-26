"use client";
import { useGlobalMood, useMoodTheme } from '@parel/core/hooks/useGlobalMood';

interface GlobalMoodBarProps {
  showTooltip?: boolean;
  compact?: boolean;
}

export function GlobalMoodBar({ showTooltip = true, compact = false }: GlobalMoodBarProps) {
  const { mood, loading } = useGlobalMood();
  const { theme, moodText, dominantEmotion } = useMoodTheme(mood);

  if (loading) {
    return (
      <div className="w-full h-8 bg-gray-200 rounded animate-pulse">
        <div className="flex items-center justify-center h-full text-xs text-gray-500">
          Loading mood...
        </div>
      </div>
    );
  }

  if (!mood) return null;

  // Calculate progress bar widths based on scores
  const total = Math.abs(mood.scoreJoy) + Math.abs(mood.scoreSad) + Math.abs(mood.scoreAnger) + Math.abs(mood.scoreCalm);
  const normalizedTotal = total > 0 ? total : 1;
  
  const joyWidth = (Math.abs(mood.scoreJoy) / normalizedTotal) * 100;
  const sadWidth = (Math.abs(mood.scoreSad) / normalizedTotal) * 100;
  const angerWidth = (Math.abs(mood.scoreAnger) / normalizedTotal) * 100;
  const calmWidth = (Math.abs(mood.scoreCalm) / normalizedTotal) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xl">{theme.emoji}</span>
        <span className="text-sm font-semibold capitalize">{dominantEmotion}</span>
        {showTooltip && (
          <div className="text-xs text-gray-600">{moodText}</div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded border p-3 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{theme.emoji}</span>
          <div>
            <div className="font-semibold capitalize">{dominantEmotion}</div>
            {showTooltip && (
              <div className="text-xs text-gray-600">{moodText}</div>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Updated: {mood.updatedAt ? new Date(mood.updatedAt).toLocaleTimeString() : 'Just now'}
        </div>
      </div>

      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
        {joyWidth > 0 && (
          <div
            className="bg-yellow-400 h-full transition-all"
            style={{ width: `${joyWidth}%` }}
            title={`Joy: ${(mood.scoreJoy * 100).toFixed(1)}%`}
          />
        )}
        {calmWidth > 0 && (
          <div
            className="bg-green-400 h-full transition-all"
            style={{ width: `${calmWidth}%` }}
            title={`Calm: ${(mood.scoreCalm * 100).toFixed(1)}%`}
          />
        )}
        {sadWidth > 0 && (
          <div
            className="bg-gray-500 h-full transition-all"
            style={{ width: `${sadWidth}%` }}
            title={`Sad: ${(mood.scoreSad * 100).toFixed(1)}%`}
          />
        )}
        {angerWidth > 0 && (
          <div
            className="bg-red-500 h-full transition-all"
            style={{ width: `${angerWidth}%` }}
            title={`Anger: ${(mood.scoreAnger * 100).toFixed(1)}%`}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
        <div className="flex gap-4">
          <span>Joy: {(mood.scoreJoy * 100).toFixed(0)}%</span>
          <span>Calm: {(mood.scoreCalm * 100).toFixed(0)}%</span>
          <span>Sad: {(mood.scoreSad * 100).toFixed(0)}%</span>
          <span>Anger: {(mood.scoreAnger * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}

