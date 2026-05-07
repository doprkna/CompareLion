'use client';

/**
 * Parallel Card (C16) - Shows one similar user with similarity %, shared count, disagreement, Compare CTA
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { Icon } from '@parel/ui';
import { formatDisplayName, sanitizeDisplayValue } from '@/lib/flow/sanitizeDisplayValue';
import { FLOW_CONTENT_KEYS } from '@/lib/content/flowContent';
import { resolveContent } from '@/lib/content/resolveContent';

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
  const safeName = formatDisplayName(parallel.name, parallel.userId);
  const safeDifferenceQuestion = sanitizeDisplayValue(parallel.biggestDisagreement?.questionText);
  const safeDifferenceYou = sanitizeDisplayValue(parallel.biggestDisagreement?.you);
  const safeDifferenceThem = sanitizeDisplayValue(parallel.biggestDisagreement?.them);
  const canShowBiggestDifference =
    Boolean(safeDifferenceQuestion) && Boolean(safeDifferenceYou) && Boolean(safeDifferenceThem);
  const titleTemplateKeys = [
    FLOW_CONTENT_KEYS.parallelTitleVariant1,
    FLOW_CONTENT_KEYS.parallelTitleVariant2,
    FLOW_CONTENT_KEYS.parallelTitleVariant3,
  ] as const;
  const templateKey = titleTemplateKeys[Math.abs(parallel.userId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % titleTemplateKeys.length];
  const titleTemplate = resolveContent(templateKey, 'You and {name} think alike');
  const title = titleTemplate.replace('{name}', safeName);

  return (
    <Card className="border-border/80 bg-card hover:border-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="font-semibold text-text">{title}</div>
            <div className="text-3xl font-bold text-accent leading-none">{parallel.similarityPercent}% match</div>
            <div className="text-sm text-subtle">
              {parallel.sharedAnswersCount} shared answers
            </div>
            {canShowBiggestDifference && (
              <div className="mt-2 text-xs text-subtle border-l-2 border-border pl-2">
                <div className="font-medium text-text-secondary">Biggest difference:</div>
                <div className="line-clamp-2" title={safeDifferenceQuestion}>
                  {safeDifferenceQuestion}
                </div>
                <div className="line-clamp-2">You: {safeDifferenceYou} · Them: {safeDifferenceThem}</div>
              </div>
            )}
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => router.push(`/compare/${parallel.userId}`)}
          >
            <Icon name="arrow-right" className="h-4 w-4 mr-1" />
            {resolveContent(FLOW_CONTENT_KEYS.ctaCompareAnswers, 'Compare answers')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
