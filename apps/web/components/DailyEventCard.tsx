"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/lib/i18n/useLocale';
import { toast } from 'sonner';

type EventResp = { success: boolean; region: string; event: { title: string; reward: string } | null };

export default function DailyEventCard() {
  const { region, lang } = useLocale();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EventResp | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/events/today?region=${encodeURIComponent(region)}&lang=${encodeURIComponent(lang)}`, { cache: 'no-store' });
        const json = await res.json();
        if (mounted) setData(json);
      } catch {
        if (mounted) setData({ success: true, region: region.toUpperCase(), event: null });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [region, lang]);

  if (loading || !data || !data.event) return null;

  const { event } = data;
  const chip = data.region || 'GLOBAL';

  return (
    <Card className="mb-4 bg-card border-border text-text">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 border-slate-300">
            {chip}
          </span>
          <span>🎯 Daily Wildcard</span>
        </CardTitle>
        <Button size="sm" onClick={() => toast.success('Challenge accepted!')}>Join Challenge</Button>
      </CardHeader>
      <CardContent>
        <div className="text-sm font-semibold mb-1">{event.title}</div>
        <div className="text-xs text-slate-600">Reward: {event.reward}</div>
      </CardContent>
    </Card>
  );
}


