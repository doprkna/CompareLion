"use client";

interface RoastBadgeProps {
  level: number;
  compact?: boolean;
  showLabel?: boolean;
}

export function RoastBadge({ level, compact = false, showLabel = true }: RoastBadgeProps) {
  const badges: Record<number, { icon: string; label: string; color: string }> = {
    1: { icon: '🧁', label: 'Gentle Soul', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    2: { icon: '😊', label: 'Mild', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    3: { icon: '⚖️', label: 'Balanced', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    4: { icon: '💪', label: 'Bold', color: 'bg-orange-100 text-orange-700 border-orange-300' },
    5: { icon: '🔥', label: 'Unfiltered', color: 'bg-red-100 text-red-700 border-red-300' },
  };

  const badgeInfo = badges[level] || badges[3];

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${badgeInfo.color}`}>
        <span>{badgeInfo.icon}</span>
        {showLabel && <span>{badgeInfo.label}</span>}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border-2 ${badgeInfo.color}`}>
      <span className="text-lg">{badgeInfo.icon}</span>
      {showLabel && <span className="font-semibold">{badgeInfo.label}</span>}
    </div>
  );
}

