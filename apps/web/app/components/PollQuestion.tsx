/**
 * Poll Question Component
 * Display poll options and handle voting
 * v0.37.4 - Poll Option Feature
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/apiBase';
import { toast } from 'sonner';
import useSWR from 'swr';
import { PollOption } from '@/lib/questions/poll/types';

interface PollQuestionProps {
  questionId: string;
  className?: string;
}

const fetcher = (url: string) => apiFetch(url).then((res: any) => res.ok ? res.data?.results : null);

export function PollQuestion({ questionId, className }: PollQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const { data: results, isLoading, mutate } = useSWR(
    `/api/questions/poll/results?questionId=${questionId}`,
    fetcher
  );

  useEffect(() => {
    if (results) {
      setSelectedOption(results.userVote || null);
      setHasVoted(!!results.userVote);
    }
  }, [results]);

  async function handleVote(optionId: string) {
    if (voting || hasVoted) return;

    setVoting(true);

    try {
      const res = await apiFetch('/api/questions/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, optionId }),
      });

      if (!(res as any).ok) {
        throw new Error((res as any).error || 'Failed to vote');
      }

      setSelectedOption(optionId);
      setHasVoted(true);
      toast.success('Vote recorded');
      
      // Refresh results
      await mutate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-4 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const options = results.options as PollOption[];
  const totalVotes = results.totalVotes || 0;

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        {options.map((option) => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
          const isSelected = selectedOption === option.id;
          const isVoted = hasVoted;

          return (
            <div key={option.id} className="space-y-2">
              <Button
                onClick={() => handleVote(option.id)}
                disabled={voting || isVoted}
                variant={isSelected ? 'default' : 'outline'}
                className={`w-full justify-start h-auto p-3 ${
                  isSelected ? 'bg-accent border-accent' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    <span className="font-medium">{option.id}.</span>
                    <span>{option.text}</span>
                  </div>
                  {isVoted && (
                    <span className="text-sm font-semibold">
                      {option.votes} ({percentage.toFixed(0)}%)
                    </span>
                  )}
                </div>
              </Button>
              
              {isVoted && (
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
        
        {isVoted && (
          <div className="text-sm text-gray-400 text-center pt-2">
            Total votes: {totalVotes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

