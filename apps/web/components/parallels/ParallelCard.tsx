'use client';

/**
 * Parallel Card (C16) - Shows one similar user with similarity %, shared count, disagreement, Compare CTA
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Icon } from '@parel/ui';

export interface ParallelUser {
  userId: string;
  name: string;
  location: string;
  similarityPercent: number;
  sharedAnswersCount: number;
  totalComparedQuestions: number;
  biggestDisagreement: { questionText: string; you: string; them: string } | null;
}

interface ParallelCardProps {
  parallel: ParallelUser;
}

export function ParallelCard({ parallel }: ParallelCardProps) {
  const router = useRouter();
  const displayName = `${parallel.name}${parallel.location ? ` (${parallel.location})` : ''}`;

  return (
    <Card className="border-border bg-card hover:border-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold text-text">{displayName}</div>
            <div className="text-2xl font-bold text-accent mt-1">{parallel.similarityPercent}%</div>
            <div className="text-sm text-subtle mt-0.5">
              {parallel.sharedAnswersCount} shared answers
            </div>
            {parallel.biggestDisagreement && (
              <div className="mt-2 text-xs text-subtle border-l-2 border-border pl-2">
                <div className="font-medium text-text-secondary">Biggest difference:</div>
                <div className="truncate" title={parallel.biggestDisagreement.questionText}>
                  {parallel.biggestDisagreement.questionText}
                </div>
                <div>You: {parallel.biggestDisagreement.you} · Them: {parallel.biggestDisagreement.them}</div>
              </div>
            )}
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => router.push(`/compare/${parallel.userId}`)}
          >
            <Icon name="arrow-right" className="h-4 w-4 mr-1" />
            Compare
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
