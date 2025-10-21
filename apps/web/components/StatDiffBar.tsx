/**
 * StatDiffBar Component
 * 
 * Shows a comparison bar between two users' stats.
 * Visual diff with color-coded sides.
 */

interface StatDiffBarProps {
  statName: string;
  icon: string;
  color: string;
  leftValue: number;
  rightValue: number;
  leftName: string;
  rightName: string;
}

export default function StatDiffBar({
  statName,
  icon,
  color,
  leftValue,
  rightValue,
  leftName,
  rightName,
}: StatDiffBarProps) {
  const maxValue = Math.max(leftValue, rightValue, 1);
  const leftPercent = (leftValue / maxValue) * 100;
  const rightPercent = (rightValue / maxValue) * 100;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {icon} {statName}
        </span>
        <div className="flex gap-4 text-xs text-subtle">
          <span>{leftValue}</span>
          <span>vs</span>
          <span>{rightValue}</span>
        </div>
      </div>

      {/* Diff Bar */}
      <div className="relative h-8 bg-bg border border-border rounded-lg overflow-hidden">
        {/* Left side (current user) */}
        <div
          className={`absolute left-0 top-0 h-full ${color} opacity-70 transition-all duration-500`}
          style={{ width: `${leftPercent / 2}%` }}
        />
        
        {/* Right side (target user) */}
        <div
          className={`absolute right-0 top-0 h-full ${color} opacity-40 transition-all duration-500`}
          style={{ width: `${rightPercent / 2}%` }}
        />

        {/* Center divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border z-10" />

        {/* Winner indicator */}
        {leftValue !== rightValue && (
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-xs font-bold text-white ${
              leftValue > rightValue ? 'left-2' : 'right-2'
            }`}
          >
            {leftValue > rightValue ? '👑' : ''}
            {rightValue > leftValue ? '👑' : ''}
          </div>
        )}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-subtle">
        <span>{leftName}</span>
        <span>{rightName}</span>
      </div>
    </div>
  );
}










