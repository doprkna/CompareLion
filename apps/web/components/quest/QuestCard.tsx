'use client';

import { Quest } from '@parel/core/hooks/useQuests';
import { QuestProgressBar } from './QuestProgressBar';
import { QuestLoreTooltip } from './QuestLoreTooltip';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestCardProps {
  quest: Quest;
  onClaim?: () => void;
  claiming?: boolean;
}

export function QuestCard({ quest, onClaim, claiming }: QuestCardProps) {
  const typeColors = {
    daily: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    weekly: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    story: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    side: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  const statusColor = quest.isCompleted
    ? 'border-green-500 bg-green-50 dark:bg-green-950'
    : quest.progressPercent > 0
    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
    : 'border-gray-300 bg-card';

  return (
    <Card className={cn('relative transition-all', statusColor)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {quest.isCompleted ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5 text-subtle" />
              )}
              {quest.title}
            </CardTitle>
            <CardDescription className="mt-1">{quest.description}</CardDescription>
          </div>
          <span className={cn('px-2 py-1 text-xs rounded-full font-medium', typeColors[quest.type])}>
            {quest.type}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <QuestProgressBar
          progress={quest.progress}
          max={quest.requirementValue}
          requirementType={quest.requirementType}
        />

        {/* Rewards Preview */}
        <div className="flex flex-wrap gap-2 text-sm">
          {quest.rewardXP > 0 && (
            <span className="px-2 py-1 rounded bg-accent/10 text-accent">
              +{quest.rewardXP} XP
            </span>
          )}
          {quest.rewardGold > 0 && (
            <span className="px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
              +{quest.rewardGold} Gold
            </span>
          )}
          {quest.rewardKarma > 0 && (
            <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
              +{quest.rewardKarma} Karma
            </span>
          )}
          {quest.rewardBadge && (
            <span className="px-2 py-1 rounded bg-accent/10 text-accent">
              🏅 Badge
            </span>
          )}
        </div>

        {/* Claim Button */}
        {quest.canClaim && onClaim && (
          <Button
            onClick={onClaim}
            disabled={claiming}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            <Gift className="w-4 h-4 mr-2" />
            {claiming ? 'Claiming...' : 'Claim Reward'}
          </Button>
        )}

        {quest.isClaimed && (
          <QuestLoreTooltip lore={quest.lore || null}>
            <div className="text-center text-green-500 font-semibold text-sm cursor-help">
              ✓ Reward Claimed
            </div>
          </QuestLoreTooltip>
        )}
      </CardContent>
    </Card>
  );
}

