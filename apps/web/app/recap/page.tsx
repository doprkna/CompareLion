'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RecapPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recap, setRecap] = useState<{
    yesterdayAnswered: number;
    yesterdayXp: number;
    streakCount: number;
    yesterdayCharmsCompleted?: number;
    yesterdayCharmsTotal?: number;
  } | null>(null);
  const [todayCharms, setTodayCharms] = useState<{ completedCount: number; total: number } | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session) {
      router.push('/login');
      return;
    }
    Promise.all([
      fetch('/api/welcome/recap').then((r) => r.ok ? r.json() : null),
      fetch('/api/charms/today').then((r) => r.ok ? r.json() : null),
    ]).then(([recapRes, charmsRes]) => {
      if (recapRes?.ok && recapRes?.data) setRecap(recapRes.data);
      const d = charmsRes?.data;
      if (d?.total != null) setTodayCharms({ completedCount: d.completedCount ?? 0, total: d.total });
    }).catch(() => {});
  }, [session, status, router]);

  if (status !== 'authenticated') return null;

  const yd = new Date();
  yd.setDate(yd.getDate() - 1);
  const yesterdayLabel = yd.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6 max-w-xl mx-auto">
      <Button
        variant="ghost"
        className="mb-4 -ml-2"
        onClick={() => router.push('/main')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Yesterday&apos;s Report</CardTitle>
          <p className="text-sm text-subtle">{yesterdayLabel}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {recap ? (
            <>
              <p><strong>{recap.yesterdayAnswered}</strong> question{recap.yesterdayAnswered !== 1 ? 's' : ''} answered</p>
              <p><strong>+{recap.yesterdayXp}</strong> XP earned</p>
              {recap.streakCount > 0 && (
                <p>🔥 <strong>{recap.streakCount}</strong> day streak</p>
              )}
              {recap.yesterdayCharmsTotal != null && recap.yesterdayCharmsTotal > 0 && (
                <p>✨ You completed {recap.yesterdayCharmsCompleted ?? 0}/{recap.yesterdayCharmsTotal} charms yesterday.</p>
              )}
            </>
          ) : (
            <p className="text-subtle">Loading…</p>
          )}
        </CardContent>
      </Card>

      {todayCharms && todayCharms.total > 0 && (
        <Card className="mt-4 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Today&apos;s Charms</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You completed {todayCharms.completedCount}/{todayCharms.total} charms today.</p>
          </CardContent>
        </Card>
      )}

      <Button
        className="w-full mt-6"
        onClick={() => router.push('/flow-demo')}
      >
        Start Today&apos;s Flow
      </Button>
    </div>
  );
}
