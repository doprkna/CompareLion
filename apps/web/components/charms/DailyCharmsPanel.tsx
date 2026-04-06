'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface CharmItem {
  key: string;
  title: string;
  progress: number;
  target: number;
  completed: boolean;
  xpReward: number;
}

interface CharmsData {
  items: CharmItem[];
  total: number;
  completedCount: number;
}

export function DailyCharmsPanel() {
  const { status } = useSession();
  const [data, setData] = useState<CharmsData | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/charms/today')
      .then((r) => r.json())
      .then((j) => {
        const d = j?.data;
        if (d?.items) setData({ items: d.items, total: d.total, completedCount: d.completedCount });
      })
      .catch(() => {});
  }, [status]);

  if (status !== 'authenticated' || !data || data.total === 0) return null;

  const { items, total, completedCount } = data;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-fit">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/70 border border-border hover:bg-card text-sm text-subtle hover:text-text transition-colors"
          aria-expanded={open}
        >
          <Sparkles className="h-4 w-4 text-accent" />
          <span>Today&apos;s Charms ({completedCount}/{total})</span>
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 p-3 rounded-lg bg-card/80 border border-border shadow-lg min-w-[220px]">
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li
                key={item.key}
                className={`flex items-center gap-2 ${item.completed ? 'text-accent line-through opacity-80' : 'text-text'}`}
              >
                <span className="shrink-0">
                  {item.completed ? '✓' : `[${item.progress}/${item.target}]`}
                </span>
                <span>{item.title}</span>
                {item.xpReward > 0 && (
                  <span className="text-xs text-subtle">+{item.xpReward} XP</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
