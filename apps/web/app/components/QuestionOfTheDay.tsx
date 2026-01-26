/**
 * Question of the Day Widget Component
 * Displays today's curated question
 * v0.37.10 - Question of the Day Widget
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuestionTags } from './QuestionTags';

interface QOTDData {
  questionId: string;
  text: string;
  tags?: string[];
  stats?: {
    answerCount: number;
    skipRate: number;
  };
}

interface QuestionOfTheDayProps {
  className?: string;
}

export function QuestionOfTheDay({ className = '' }: QuestionOfTheDayProps) {
  const router = useRouter();
  const [qotd, setQotd] = useState<QOTDData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQOTD = async () => {
      try {
        const response = await fetch('/api/questions/qotd');
        const data = await response.json();

        if (data.success && data.questionId) {
          setQotd({
            questionId: data.questionId,
            text: data.text,
            tags: data.tags || [],
            stats: data.stats,
          });
        } else {
          setError('No question available');
        }
      } catch (err) {
        setError('Failed to load question');
      } finally {
        setLoading(false);
      }
    };

    fetchQOTD();
  }, []);

  const handleAnswerNow = () => {
    if (qotd?.questionId) {
      // Navigate to question answer flow
      router.push(`/flow-demo?questionId=${qotd.questionId}`);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Question of the Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-subtle" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !qotd) {
    return null; // Don't show widget if no question available
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" />
          Question of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg text-text leading-relaxed">{qotd.text}</p>

        {qotd.tags && qotd.tags.length > 0 && (
          <QuestionTags tags={qotd.tags} />
        )}

        {qotd.stats && (
          <div className="text-xs text-subtle">
            {qotd.stats.answerCount} answers • {qotd.stats.skipRate.toFixed(1)}% skipped
          </div>
        )}

        <Button
          onClick={handleAnswerNow}
          className="w-full bg-accent text-white hover:bg-accent/90"
        >
          Answer Now
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

