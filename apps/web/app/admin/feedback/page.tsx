'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@parel/ui';

interface FeedbackData {
  rewardsGranted: number;
  starterCompleted: number;
  pctCompleted: number;
  totalResponses: number;
  polls: Array<{
    id: string;
    question: string;
    options: string[];
    distribution: Record<string, number>;
    totalResponses: number;
    freetexts: Array<{ userId: string; text: string; createdAt: string }>;
  }>;
}

export default function AdminFeedbackPage() {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/polls/feedback')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Icon name="spinner" className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }
  if (!data) {
    return <div className="p-6">Failed to load feedback data.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">Alpha Feedback Results</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rewards granted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.rewardsGranted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">% completed feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.pctCompleted}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.rewardsGranted} / {data.starterCompleted} (started starter)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalResponses}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {data.polls.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-base">{p.question}</CardTitle>
              <p className="text-sm text-muted-foreground">Responses: {p.totalResponses}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(p.distribution).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Distribution</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {Object.entries(p.distribution).map(([label, count]) => (
                      <li key={label}>
                        {label}: {count}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {p.freetexts.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Free text</p>
                  <ul className="space-y-2 text-sm">
                    {p.freetexts.map((ft, i) => (
                      <li key={i} className="border-l-2 border-accent pl-2 py-1">
                        {ft.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
