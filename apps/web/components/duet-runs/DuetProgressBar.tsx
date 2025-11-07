"use client";

interface DuetProgressBarProps {
  myProgress: number;
  partnerProgress: number;
  myLabel?: string;
  partnerLabel?: string;
}

export function DuetProgressBar({
  myProgress,
  partnerProgress,
  myLabel = 'Your Progress',
  partnerLabel = 'Partner Progress',
}: DuetProgressBarProps) {
  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{myLabel}</span>
          <span className="font-semibold text-blue-600">{myProgress}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${Math.min(100, myProgress)}%` }}
          >
            {myProgress >= 10 && `${myProgress}%`}
          </div>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{partnerLabel}</span>
          <span className="font-semibold text-purple-600">{partnerProgress}%</span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500 flex items-center justify-center text-xs text-white font-semibold"
            style={{ width: `${Math.min(100, partnerProgress)}%` }}
          >
            {partnerProgress >= 10 && `${partnerProgress}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

