'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  QuestionInput,
  isValidAnswer,
  toApiPayload,
  getInitialValue,
  type FlowQuestion,
  type AnswerValue,
} from '@/components/flow/QuestionInput';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ChallengeData {
  question: {
    id: string;
    text: string;
    type: string;
    options?: { id: string; label: string; value: string }[];
    categoryName?: string;
  };
  challengerBasicInfo: { name: string };
  status: string;
}

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: session, status: authStatus } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answerValue, setAnswerValue] = useState<AnswerValue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [xpBonusGranted, setXpBonusGranted] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiFetch(`/api/challenge/${id}`)
      .then((res) => {
        if (res.ok && res.data?.success && res.data?.data) {
          setData(res.data.data);
          const q = res.data.data.question as FlowQuestion;
          setAnswerValue(getInitialValue(q));
        } else {
          setData(null);
        }
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const submitAnswer = async () => {
    if (!data?.question || !answerValue || submitting) return;
    const q = data.question as FlowQuestion;
    if (!isValidAnswer(q, answerValue)) {
      toast({ title: 'Please answer the question', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = toApiPayload(q, answerValue);
      const res = await apiFetch(`/api/challenge/${id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok && res.data?.success && res.data?.data) {
        setAnswered(true);
        setCompleted(res.data.data.completed ?? false);
        setXpBonusGranted(res.data.data.xpBonusGranted ?? false);
        if (res.data.data.xpBonusGranted) {
          toast({ title: `+${20} XP challenge bonus!` });
        }
      } else {
        toast({ title: 'Failed to submit', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authStatus === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-subtle" />
      </div>
    );
  }

  if (data.status === 'expired') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <p className="text-subtle">This challenge has expired.</p>
        <Link href="/flow-demo">
          <Button variant="outline" className="mt-4">
            Start flow
          </Button>
        </Link>
      </div>
    );
  }

  if (data.status === 'completed') {
    return (
      <div className="min-h-screen bg-bg p-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-text font-medium">Comparison ready</p>
          <p className="text-sm text-subtle">Both answers are in. Open a new flow to keep comparing.</p>
          <Link href="/flow-demo">
            <Button variant="outline" className="mt-4">
              Start flow
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/flow-demo" className="text-sm text-subtle hover:text-accent mb-4 block">
          ← Back to flow
        </Link>

        <Card className="bg-card border-border mb-4">
          <CardHeader>
            <h1 className="text-xl font-bold text-text">{data.question.text}</h1>
            <p className="text-sm text-subtle">
              {data.challengerBasicInfo.name} challenged you to compare answers
            </p>
          </CardHeader>
          <CardContent>
            {!answered ? (
              <>
                <p className="text-sm text-subtle mb-2">Answer to compare</p>
                <QuestionInput
                  question={data.question as FlowQuestion}
                  value={answerValue!}
                  onChange={setAnswerValue}
                />
                <Button
                  onClick={submitAnswer}
                  disabled={submitting || !answerValue}
                  className="mt-4"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
                </Button>
              </>
            ) : completed ? (
              <div className="space-y-2">
                <p className="font-medium text-text">Comparison ready</p>
                {xpBonusGranted && (
                  <p className="text-sm text-accent">You both earned +20 XP!</p>
                )}
                <Link href="/flow-demo">
                  <Button variant="outline" className="mt-2">
                    Start flow
                  </Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-subtle">Waiting for your friend...</p>
                <Link href="/flow-demo">
                  <Button variant="outline" className="mt-2">
                    Back to flow
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
