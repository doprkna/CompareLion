'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Icon } from '@parel/ui';

interface Poll {
  id: string;
  question: string;
  options: string[];
  allowFreetext: boolean;
}

export default function AlphaFeedbackPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [optionIdx, setOptionIdx] = useState<number | null>(null);
  const [freetext, setFreetext] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/polls?packKey=alpha-feedback-v01')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.polls)) setPolls(d.polls);
      })
      .finally(() => setLoading(false));
  }, []);

  const poll = polls[idx];
  const isFreetextOnly = poll && poll.options?.length === 0 && poll.allowFreetext;
  const canSubmit = isFreetextOnly ? true : optionIdx != null || freetext.trim().length > 0;

  async function submit() {
    if (!poll || submitting) return;
    setSubmitting(true);
    try {
      const body: { pollId: string; optionIdx?: number; freetext?: string } = { pollId: poll.id };
      if (optionIdx != null) body.optionIdx = optionIdx;
      if (freetext.trim()) body.freetext = freetext.trim();
      const res = await fetch('/api/polls/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (idx >= polls.length - 1) {
          setDone(true);
        } else {
          setIdx((i) => i + 1);
          setOptionIdx(null);
          setFreetext('');
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <Icon name="spinner" className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }
  if (polls.length === 0) {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <p className="text-subtle">No feedback polls available.</p>
      </div>
    );
  }
  if (done) {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Thank you!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Thanks. Reward claimed and badge unlocked.
            </p>
            <Button onClick={() => router.push('/main')}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-xl mx-auto">
        <p className="text-sm text-subtle mb-4">
          Question {idx + 1} of {polls.length}
        </p>
        <Card>
          <CardHeader>
            <CardTitle>{poll?.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {poll?.options && poll.options.length > 0 && (
              <RadioGroup value={optionIdx?.toString() ?? ''} onValueChange={(v) => setOptionIdx(v ? parseInt(v, 10) : null)}>
                {poll.options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2 p-3 border rounded">
                    <RadioGroupItem value={i.toString()} id={`opt-${i}`} />
                    <Label htmlFor={`opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {poll?.allowFreetext && (
              <div>
                <Label htmlFor="freetext" className="text-sm text-muted-foreground">
                  {poll.options?.length ? 'Additional comments (optional)' : 'Your answer (optional)'}
                </Label>
                <Input
                  id="freetext"
                  placeholder="Type here..."
                  value={freetext}
                  onChange={(e) => setFreetext(e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="flex-1"
              >
                {submitting ? <Icon name="spinner" className="h-4 w-4 animate-spin" /> : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
