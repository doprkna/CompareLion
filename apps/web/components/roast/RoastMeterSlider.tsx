"use client";

interface RoastMeterSliderProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function RoastMeterSlider({ value, onChange, disabled }: RoastMeterSliderProps) {
  const labels = ['Gentle', 'Mild', 'Balanced', 'Bold', 'Savage'];
  const badges = ['🧁', '😊', '⚖️', '💪', '🔥'];
  const descriptions = [
    'Wholesome feedback',
    'Positive encouragement',
    'Neutral constructive',
    'Direct with humor',
    'Full roast mode',
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold">Roast/Toast Level</label>
        <span className="text-xs text-gray-500">
          {badges[value - 1]} {labels[value - 1]}
        </span>
      </div>

      <div className="relative">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          {labels.map((label, idx) => (
            <span key={idx} className={idx + 1 === value ? 'font-semibold text-amber-600' : ''}>
              {idx + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded border border-gray-200">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">{labels[value - 1]}</span>
          <span className="text-gray-500"> • {descriptions[value - 1]}</span>
        </div>
      </div>
    </div>
  );
}

