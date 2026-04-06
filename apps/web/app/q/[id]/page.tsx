'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/apiBase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookmarkButton } from '@/components/questions/BookmarkButton';
import { QuestionReactionButtons } from '@/components/questions/QuestionReactionButtons';
import { Loader2, Gem } from 'lucide-react';
import Link from 'next/link';
import { SuggestTranslationButton } from '@/components/translation/SuggestTranslationButton';

interface DetailData {
  question: {
    id: string;
    text: string;
    type: string;
    categoryId?: string;
    categoryName?: string;
    options?: { id: string; label: string; value: string }[];
  } | null;
  bookmarked: boolean;
  myLatestResponse?: { id: string; value: string; createdAt: string };
  fastReport: {
    tier: 'free' | 'premiumLocked' | 'premium';
    lines: string[];
    cta?: { label: string; href: string };
    meta?: { isBeta?: boolean };
  };
}

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated' || !id) return;
    loadDetail();
  }, [status, id, router]);

  async function loadDetail() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/questions/${id}/detail`);
      if (res.ok && res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function unlockPremium() {
    setUnlocking(true);
    try {
      const res = await apiFetch(`/api/questions/${id}/fast-report`, {
        method: 'POST',
      });
      if (res.ok && res.data?.success && res.data?.data) {
        const d = res.data.data;
        setData((prev) =>
          prev ? { ...prev, fastReport: { ...prev.fastReport, ...d } } : prev
        );
        if (d.tier === 'premiumLocked' && d.cta?.href) {
          router.push(d.cta.href);
        }
      }
    } finally {
      setUnlocking(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-subtle" />
      </div>
    );
  }

  if (!data?.question) {
    return (
      <div className="min-h-screen bg-bg p-6">
        <p className="text-subtle">Question not found.</p>
        <Link href="/flow-demo">
          <Button variant="outline" className="mt-4">
            Back to Flow
          </Button>
        </Link>
      </div>
    );
  }

  const { question, bookmarked, myLatestResponse, fastReport } = data;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 mb-4">
          <Link
            href="/flow-demo"
            className="text-sm text-subtle hover:text-accent"
          >
            ← Back to Flow
          </Link>
          <BookmarkButton
            questionId={question.id}
            bookmarked={bookmarked}
            onToggle={(b) => setData((p) => (p ? { ...p, bookmarked: b } : p))}
          />
        </div>

        <Card className="bg-card border-border mb-4">
          <CardHeader>
            <h1 className="text-xl font-bold text-text">{question.text}</h1>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {question.categoryName && (
                <p className="text-sm text-subtle">{question.categoryName}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <SuggestTranslationButton
                  entityType="question"
                  entityId={question.id}
                  originalText={question.text}
                />
                <QuestionReactionButtons questionId={question.id} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {myLatestResponse ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-subtle">Your answer:</span>{' '}
                  {myLatestResponse.value}
                </p>
                <p className="text-xs text-subtle">
                  Answered on {new Date(myLatestResponse.createdAt).toLocaleDateString()}
                </p>
                <Link href={`/flow-demo?category=${question.categoryId ?? ''}`}>
                  <Button size="sm">Answer again in Flow</Button>
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-sm text-subtle mb-2">
                  You haven&apos;t answered this yet.
                </p>
                <Link href="/flow-demo">
                  <Button>Answer now</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="py-3">
            <h2 className="text-sm font-medium text-text">Fast Report</h2>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {fastReport.lines.map((line, i) => (
              <p key={i} className="text-sm text-subtle">
                {line}
              </p>
            ))}
            {fastReport.tier === 'premiumLocked' && fastReport.cta && (
              <Button
                variant="outline"
                size="sm"
                onClick={unlockPremium}
                disabled={unlocking}
                className="mt-2"
              >
                <Gem className="h-4 w-4 mr-2" />
                {fastReport.cta.label}
              </Button>
            )}
            {fastReport.meta?.isBeta && (
              <p className="text-xs text-subtle">(beta)</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
