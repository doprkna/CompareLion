/**
 * Mini Bar Component
 * Simple horizontal bar indicator for metrics
 * v0.38.9 - Mini Metric Bars UI
 */

'use client';

interface MiniBarProps {
  label: string;
  value: number; // 0-100
  className?: string;
}

export function MiniBar({ label, value, className = '' }: MiniBarProps) {
  // Clamp value to 0-100
  const clampedValue = Math.max(0, Math.min(100, value));
  const fillPercentage = clampedValue;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-700 truncate">{label}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Bar container */}
        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
        {/* Value */}
        <div className="text-sm font-medium text-gray-900 w-8 text-right">
          {Math.round(clampedValue)}
        </div>
      </div>
    </div>
  );
}

