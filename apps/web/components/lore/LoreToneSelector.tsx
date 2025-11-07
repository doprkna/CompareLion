'use client';

import { Button } from '@/components/ui/button';
import { ScrollText, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoreToneSelectorProps {
  currentTone: 'serious' | 'comedic' | 'poetic' | null;
  onToneChange: (tone: 'serious' | 'comedic' | 'poetic') => void;
  loading?: boolean;
}

const toneOptions: Array<{
  value: 'serious' | 'comedic' | 'poetic';
  label: string;
  icon: typeof ScrollText;
  description: string;
}> = [
  {
    value: 'serious',
    label: 'Serious',
    icon: ScrollText,
    description: 'Dramatic and meaningful',
  },
  {
    value: 'comedic',
    label: 'Comedic',
    icon: Zap,
    description: 'Playful and fun',
  },
  {
    value: 'poetic',
    label: 'Poetic',
    icon: Sparkles,
    description: 'Beautiful and lyrical',
  },
];

export function LoreToneSelector({ currentTone, onToneChange, loading }: LoreToneSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-text">Narrative Tone</label>
      <div className="flex gap-2 flex-wrap">
        {toneOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = currentTone === option.value;

          return (
            <Button
              key={option.value}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onToneChange(option.value)}
              disabled={loading}
              className={cn(
                'flex-1 min-w-[120px]',
                isSelected && 'bg-accent hover:bg-accent/90 text-white'
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {option.label}
            </Button>
          );
        })}
      </div>
      <p className="text-xs text-subtle">
        Choose your preferred narrative style for generated lore entries.
      </p>
    </div>
  );
}

