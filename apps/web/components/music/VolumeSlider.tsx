'use client';

import { Slider } from '@/components/ui/slider';
import { Volume2 } from 'lucide-react';

interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function VolumeSlider({ value, onChange, className }: VolumeSliderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Volume2 className="w-4 h-4 text-muted-foreground" />
      <Slider
        value={[value * 100]}
        onValueChange={(values) => onChange(values[0] / 100)}
        max={100}
        min={0}
        step={1}
        className="w-full"
      />
      <span className="text-xs text-muted-foreground w-8 text-right">
        {Math.round(value * 100)}%
      </span>
    </div>
  );
}

