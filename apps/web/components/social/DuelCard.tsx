'use client';

import { Duel } from '@parel/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Sword, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DuelCardProps {
  duel: Duel;
  currentUserId?: string;
  onComplete?: () => void;
  completing?: boolean;
}

const challengeTypeLabels = {
  xp: 'XP Battle',
  reflection: 'Reflection Challenge',
  random: 'Random Duel',
  poll: 'Poll Duel',
};

export function DuelCard({ duel, currentUserId, onComplete, completing }: DuelCardProps) {
  const challengerName = duel.challenger?.username || 'Unknown';
  const opponentName = duel.opponent?.username || 'Unknown';
  const isCompleted = duel.status === 'completed';
  const isExpired = duel.status === 'expired';
  const isActive = duel.status === 'active';
  const isPending = duel.status === 'pending';
  const isWinner = currentUserId && duel.winnerId === currentUserId;

  return (
    <Card className={cn(
      'bg-card border-border transition-all',
      isCompleted && isWinner && 'border-green-500 bg-green-50 dark:bg-green-950',
      isCompleted && !isWinner && 'border-gray-300',
      isPending && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
      isExpired && 'opacity-60'
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5" />
              {challengeTypeLabels[duel.challengeType]}
            </CardTitle>
            <p className="text-sm text-subtle mt-1">
              {challengerName} vs {opponentName}
            </p>
          </div>
          {isCompleted && (
            <Trophy className={cn(
              'w-5 h-5',
              isWinner ? 'text-yellow-500' : 'text-gray-400'
            )} />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-subtle">Reward:</span>
          <span className="font-semibold text-text">+{duel.rewardXP} XP</span>
        </div>
        
        <div className="text-xs text-subtle">
          Status: <span className="font-semibold capitalize">{duel.status}</span>
        </div>

        {isActive && onComplete && (
          <Button
            onClick={onComplete}
            disabled={completing}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            {completing ? 'Completing...' : 'Complete Duel'}
          </Button>
        )}

        {isCompleted && isWinner && (
          <div className="text-center text-green-500 font-semibold text-sm">
            🏆 Victory!
          </div>
        )}

        {isCompleted && !isWinner && (
          <div className="text-center text-gray-500 text-sm">
            Completed
          </div>
        )}

        {isExpired && (
          <div className="text-center text-red-500 text-sm">
            Expired
          </div>
        )}
      </CardContent>
    </Card>
  );
}




