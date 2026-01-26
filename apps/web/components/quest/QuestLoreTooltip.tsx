'use client';

import { QuestLore } from '@parel/core/hooks/useQuestLore';
import { ScrollText, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

interface QuestLoreTooltipProps {
  lore: QuestLore | null;
  children: React.ReactNode;
}

const toneIcons = {
  serious: ScrollText,
  comedic: Zap,
  poetic: Sparkles,
};

const toneColors = {
  serious: 'text-blue-500 dark:text-blue-400',
  comedic: 'text-yellow-500 dark:text-yellow-400',
  poetic: 'text-purple-500 dark:text-purple-400',
};

export function QuestLoreTooltip({ lore, children }: QuestLoreTooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!lore) {
    return <>{children}</>;
  }

  const Icon = toneIcons[lore.tone];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-3 bg-card border-2 border-border rounded-lg shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={cn('w-4 h-4', toneColors[lore.tone])} />
            <p className="text-xs font-semibold text-text uppercase">Lore</p>
          </div>
          <p className="text-sm text-text italic leading-relaxed">{lore.text}</p>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
          </div>
        </div>
      )}
    </div>
  );
}

