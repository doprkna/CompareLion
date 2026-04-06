'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface MilestoneNudgePayload {
  id: string;
  key: string;
  title: string;
  body: string;
  variant: string;
  autoDismissMs: number;
  meta?: Record<string, unknown>;
}

const EVENT_NAME = 'milestone:nudge';

export function MilestoneNudgeHost() {
  const [nudge, setNudge] = useState<MilestoneNudgePayload | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const payload = (e as CustomEvent).detail as MilestoneNudgePayload;
      if (!payload?.title) return;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setNudge(payload);
      const ms = payload.autoDismissMs ?? 2500;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setNudge(null);
      }, ms);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!nudge) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 pointer-events-auto">
      <Card className="bg-card border-border shadow-lg border">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-text">{nudge.title}</h3>
              <p className="text-sm text-subtle mt-0.5">{nudge.body}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => {
                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = null;
                setNudge(null);
              }}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
